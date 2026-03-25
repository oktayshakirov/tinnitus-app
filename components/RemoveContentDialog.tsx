import { Alert } from "react-native";

interface RemoveContentDialogProps {
  contentType: "posts";
  onRemove: () => Promise<boolean>;
  onSuccess?: () => void;
  onError?: () => void;
}

export const RemoveContentDialog = {
  show: ({
    onRemove,
    onSuccess,
    onError,
  }: RemoveContentDialogProps) => {
    Alert.alert(
      "Remove Post",
      "Are you sure you want to remove this saved post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await onRemove();
              if (success) {
                onSuccess?.();
              } else {
                onError?.();
              }
            } catch {
              onError?.();
            }
          },
        },
      ]
    );
  },
};
