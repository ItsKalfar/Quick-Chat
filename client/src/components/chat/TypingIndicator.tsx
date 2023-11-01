import SyncLoader from "react-spinners/SyncLoader";
export const Typing = () => {
  return (
    <SyncLoader
      color={"#8080ff"}
      loading={true}
      size={5}
      speedMultiplier={0.65}
      aria-label="Typing spinner"
      data-testid="typing"
    />
  );
};
