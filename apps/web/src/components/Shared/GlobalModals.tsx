import NewPublication from "@components/Composer/NewPublication";
import ReportPost from "@components/Shared/Modal/ReportPost";
import { Modal } from "@hey/ui";
import type { FC } from "react";
import { useFundModalStore } from "src/store/non-persisted/modal/useFundModalStore";
import { useReportAccountModalStore } from "src/store/non-persisted/modal/useReportAccountModalStore";
import { useGlobalModalStore } from "src/store/non-persisted/useGlobalModalStore";
import { useAccount } from "wagmi";
import Auth from "./Auth";
import { useSignupStore } from "./Auth/Signup";
import GlobalModalsFromUrl from "./GlobalModalsFromUrl";
import OptimisticTransactions from "./Modal/OptimisticTransactions";
import ReportAccount from "./Modal/ReportAccount";
import SwitchAccounts from "./SwitchAccounts";

const GlobalModals: FC = () => {
  const {
    authModalType,
    reportingAccount,
    reportingPostId,
    setShowAuthModal,
    setShowNewPostModal,
    setShowOptimisticTransactionsModal,
    setShowAccountSwitchModal,
    setShowPostReportModal,
    showAuthModal,
    showNewPostModal,
    showOptimisticTransactionsModal,
    showAccountSwitchModal,
    showPostReportModal
  } = useGlobalModalStore();

  const { showReportAccountModal, setShowReportAccountModal } =
    useReportAccountModalStore();
  const { showFundModal, setShowFundModal } = useFundModalStore();

  const { screen: signupScreen } = useSignupStore();
  const { address } = useAccount();

  const authModalTitle =
    authModalType === "signup"
      ? signupScreen === "choose"
        ? "Signup"
        : null
      : "Login";

  return (
    <>
      <GlobalModalsFromUrl />
      <Modal
        onClose={() => setShowPostReportModal(false, reportingPostId)}
        show={showPostReportModal}
        title="Report Post"
      >
        <ReportPost postId={reportingPostId} />
      </Modal>
      <Modal
        onClose={() => setShowReportAccountModal(false, reportingAccount)}
        show={showReportAccountModal}
        title="Report account"
      >
        <ReportAccount account={reportingAccount} />
      </Modal>
      <Modal
        onClose={() => setShowAccountSwitchModal(false)}
        show={showAccountSwitchModal}
        size={address ? "xs" : "sm"}
        title="Switch Account"
      >
        <SwitchAccounts />
      </Modal>
      <Modal
        onClose={() => setShowAuthModal(false, authModalType)}
        show={showAuthModal}
        title={authModalTitle}
      >
        <Auth />
      </Modal>
      <Modal
        onClose={() => setShowNewPostModal(false)}
        show={showNewPostModal}
        size="md"
        title="Create post"
      >
        <NewPublication className="!rounded-b-xl !rounded-t-none border-none" />
      </Modal>
      <Modal
        onClose={() => setShowOptimisticTransactionsModal(false)}
        show={showOptimisticTransactionsModal}
        title="Optimistic Transactions"
      >
        <OptimisticTransactions />
      </Modal>
      <Modal
        onClose={() => setShowFundModal(false)}
        show={showFundModal}
        title="Fund account"
      >
        <div>WIP</div>
      </Modal>
    </>
  );
};

export default GlobalModals;
