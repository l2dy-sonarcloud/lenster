import { InMemoryCache } from '@apollo/client';
import result from '../../generated';
import createPostReactionsFieldPolicy from './createPostReactionsFieldPolicy';
import createPostReferencesFieldPolicy from './createPostReferencesFieldPolicy';
import createPostsFieldPolicy from './createPostsFieldPolicy';
import createWhoReferencedPostFieldPolicy from './createWhoReferencedPostFieldPolicy';

const cache = new InMemoryCache({
  possibleTypes: result.possibleTypes,
  typePolicies: {
    Query: {
      fields: {
        posts: createPostsFieldPolicy(),
        postReferences: createPostReferencesFieldPolicy(),
        postReactions: createPostReactionsFieldPolicy(),
        whoReferencedPost: createWhoReferencedPostFieldPolicy()
      }
    }
  }
});

export default cache;
