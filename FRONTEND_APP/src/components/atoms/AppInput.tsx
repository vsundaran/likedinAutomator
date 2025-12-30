import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export type AppInputProps = TextFieldProps;

export function AppInput(props: AppInputProps) {
    return <TextField {...props} />;
}
