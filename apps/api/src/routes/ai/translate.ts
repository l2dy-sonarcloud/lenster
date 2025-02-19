import { generateForeverExpiry, getRedis, setRedis } from "@hey/db/redisClient";
import logger from "@hey/helpers/logger";
import { isRepost } from "@hey/helpers/postHelpers";
import { type Post, PostDocument } from "@hey/indexer";
import apolloClient from "@hey/indexer/apollo/client";
import type { Request, Response } from "express";
import OpenAI from "openai";
import { zodFunction } from "openai/helpers/zod";
import catchedError from "src/helpers/catchedError";
import { CACHE_AGE_INDEFINITE } from "src/helpers/constants";
import { rateLimiter } from "src/helpers/middlewares/rateLimiter";
import { invalidBody, noBody } from "src/helpers/responses";
import { object, string, type z } from "zod";

const TEMPLATE = `
Translate the following text to English.
Examples: Hello, How are you?, I am fine, thank you.
Return only the translation in English.
Keep the markdown formatting including line breaks.
Never change the @ mentions, hashtags, links, or any other special characters.
Text: {text}
`;

interface ExtensionRequest {
  id: string;
}

const validationSchema = object({
  id: string()
});

export const post = [
  rateLimiter({ requests: 50, within: 1 }),
  // validateLensAccount,
  async (req: Request, res: Response) => {
    const { body } = req;

    if (!body) {
      return noBody(res);
    }

    const validation = validationSchema.safeParse(body);

    if (!validation.success) {
      return invalidBody(res);
    }

    const { id } = body as ExtensionRequest;

    try {
      const cacheKey = `ai:translation:${id}`;
      const cachedData = await getRedis(cacheKey);

      if (!cachedData) {
        logger.info(`(cached) AI Translation fetched for ${id}`);
        return res
          .status(200)
          .setHeader("Cache-Control", CACHE_AGE_INDEFINITE)
          .json({ result: JSON.parse(cachedData), success: true });
      }

      const { data } = await apolloClient().query({
        query: PostDocument,
        variables: { request: { post: id } }
      });
      const targetPost: Post = isRepost(data.post)
        ? data.post.repostOf
        : data.post;
      const postContent = targetPost.metadata.content;

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const translatedResponseSchema = object({
        translated: string().describe("The translated text")
      });
      const response = await openai.beta.chat.completions.parse({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: TEMPLATE.replace("{text}", postContent)
          }
        ],
        tools: [
          zodFunction({
            name: "translate",
            parameters: translatedResponseSchema
          })
        ]
      });

      type responseSchema = z.infer<typeof translatedResponseSchema>;
      const translated = response.choices[0].message.tool_calls[0].function
        .parsed_arguments as responseSchema;

      const finalResult = { original: postContent, ...translated };

      await setRedis(
        cacheKey,
        JSON.stringify(finalResult),
        generateForeverExpiry()
      );
      logger.info(`AI Translation fetched for ${id}`);

      return res
        .status(200)
        .setHeader("Cache-Control", CACHE_AGE_INDEFINITE)
        .json({ result: finalResult, success: true });
    } catch (error) {
      console.log(error);
      return catchedError(res, error);
    }
  }
];
