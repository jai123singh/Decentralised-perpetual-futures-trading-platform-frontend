import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import Button from "./UIComponents/HelperComponents/Button/Button";
import "./App.css";

export const Account = ({
  changeStateForModalToFalse,
}: {
  changeStateForModalToFalse: () => void;
}) => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  function onclickingDisconnectButton() {
    disconnect();
    changeStateForModalToFalse();
  }

  return (
    <div>
      <div>
        {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
        {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      </div>
      <Button
        className="walletButton walletButton-responsive"
        onClick={onclickingDisconnectButton}
      >
        Disconnect
      </Button>
    </div>
  );
};
