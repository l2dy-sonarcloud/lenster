import { Errors } from "@hey/data/errors";
import { useDeletePostMutation } from "@hey/indexer";
import { Alert } from "@hey/ui";
import type { FC } from "react";
import { toast } from "react-hot-toast";
import { useDeletePostAlertStore } from "src/store/non-persisted/alert/useDeletePostAlertStore";
import { useAccountStatus } from "src/store/non-persisted/useAccountStatus";

const DeletePost: FC = () => {
  const { deletingPost, setShowPostDeleteAlert, showPostDeleteAlert } =
    useDeletePostAlertStore();
  const { isSuspended } = useAccountStatus();

  const [deletePost, { loading }] = useDeletePostMutation({
    onCompleted: () => {
      setShowPostDeleteAlert(false, null);
      toast.success("Post deleted");
    },
    update: (cache) => {
      cache.evict({
        id: `${deletingPost?.__typename}:${deletingPost?.id}`
      });
    }
  });

  const deletePublication = async () => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    return await deletePost({
      variables: { request: { post: deletingPost?.id } }
    });
  };

  return (
    <Alert
      confirmText="Delete"
      description="This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results."
      isDestructive
      isPerformingAction={loading}
      onClose={() => setShowPostDeleteAlert(false, null)}
      onConfirm={deletePublication}
      show={showPostDeleteAlert}
      title="Delete Publication?"
    />
  );
};

export default DeletePost;
