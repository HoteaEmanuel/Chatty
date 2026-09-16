
type ActionSheetProps = {
  setSheetVisible: (state: boolean) => void;
  setSheetAnchor: ({
    x,
    y,
    width,
    height,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;

  ref: React.RefObject<any> | null;
  onPickFromLibrary: () => void;
  onTakePhoto: () => void;
};

export const useActionSheet = ({
  setSheetVisible,
  setSheetAnchor,
  ref,
  onPickFromLibrary,
  onTakePhoto,
}: ActionSheetProps) => {
  const openSheet = () => {
    ref?.current?.measureInWindow((x, y, width, height) => {
      setSheetAnchor({ x, y, width, height });
      setSheetVisible(true);
    });
  };

  const handleChooseLibrary = onPickFromLibrary
    ? () => {
        setSheetVisible(false);
        onPickFromLibrary();
      }
    : undefined;

  const handleTakePhoto = onTakePhoto
    ? () => {
        setSheetVisible(false);
        onTakePhoto();
      }
    : undefined;

  return { openSheet, handleChooseLibrary, handleTakePhoto };
};
