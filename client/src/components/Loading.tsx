import BeatLoader from "react-spinners/BeatLoader";

export const Loading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <BeatLoader
        color={"#8080ff"}
        loading={true}
        size={10}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};
