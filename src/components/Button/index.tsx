import { TouchableOpacity, TouchableHighlightProps, Text } from "react-native";

import { styles } from "./styles";

interface ButtonProps extends TouchableHighlightProps {
  title: string;
}

export function Button({ title, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.container} {...rest}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
