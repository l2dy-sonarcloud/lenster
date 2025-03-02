import uploadToStorageNode from "@helpers/uploadToStorageNode";
import type { NewAttachment } from "@hey/types/misc";
import imageCompression from "browser-image-compression";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { usePostAttachmentStore } from "src/store/non-persisted/post/usePostAttachmentStore";
import { v4 as uuid } from "uuid";

const useUploadAttachments = () => {
  const {
    addAttachments,
    removeAttachments,
    setIsUploading,
    updateAttachments
  } = usePostAttachmentStore((state) => state);

  const handleUploadAttachments = useCallback(
    async (attachments: FileList): Promise<NewAttachment[]> => {
      const validateFileSize = (file: File) => {
        const isImage = file.type.includes("image");
        const isVideo = file.type.includes("video");
        const isAudio = file.type.includes("audio");

        const IMAGE_UPLOAD_LIMIT = 50000000;
        const VIDEO_UPLOAD_LIMIT = 2000000000;
        const AUDIO_UPLOAD_LIMIT = 600000000;

        if (isImage && file.size > IMAGE_UPLOAD_LIMIT) {
          toast.error(
            `Image size should be less than ${IMAGE_UPLOAD_LIMIT / 1000000}MB`
          );
          return false;
        }

        if (isVideo && file.size > VIDEO_UPLOAD_LIMIT) {
          toast.error(
            `Video size should be less than ${VIDEO_UPLOAD_LIMIT / 1000000}MB`
          );
          return false;
        }

        if (isAudio && file.size > AUDIO_UPLOAD_LIMIT) {
          toast.error(
            `Audio size should be less than ${AUDIO_UPLOAD_LIMIT / 1000000}MB`
          );
          return false;
        }

        return true;
      };

      setIsUploading(true);

      const files = Array.from(attachments);
      const attachmentIds: string[] = [];

      const compressedFiles = await Promise.all(
        files.map(async (file: File) => {
          if (file.type.includes("image") && !file.type.includes("gif")) {
            return await imageCompression(file, {
              exifOrientation: 1,
              maxSizeMB: 6,
              maxWidthOrHeight: 6000,
              useWebWorker: true
            });
          }

          return file;
        })
      );

      const previewAttachments: NewAttachment[] = compressedFiles.map(
        (file: File) => {
          const attachmentId = uuid();
          attachmentIds.push(attachmentId);

          return {
            file,
            id: attachmentId,
            mimeType: file.type,
            previewUri: URL.createObjectURL(file),
            type: file.type.includes("image")
              ? "Image"
              : file.type.includes("video")
                ? "Video"
                : "Audio"
          };
        }
      );

      if (compressedFiles.some((file) => validateFileSize(file))) {
        addAttachments(previewAttachments);

        try {
          const attachmentsUploaded =
            await uploadToStorageNode(compressedFiles);
          const attachments = attachmentsUploaded.map((uploaded, index) => ({
            ...previewAttachments[index],
            mimeType: uploaded.mimeType,
            uri: uploaded.uri
          }));

          updateAttachments(attachments);
          setIsUploading(false);

          return attachments;
        } catch {
          toast.error("Something went wrong while uploading!");
          removeAttachments(attachmentIds);
        }
      } else {
        removeAttachments(attachmentIds);
      }

      setIsUploading(false);
      return [];
    },
    [addAttachments, removeAttachments, updateAttachments, setIsUploading]
  );

  return { handleUploadAttachments };
};

export default useUploadAttachments;
