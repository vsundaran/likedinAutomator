import { TextField, InputAdornment, IconButton } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export type AppInputProps = TextFieldProps;

export function AppInput(props: AppInputProps) {
    const { type, InputProps, ...rest } = props;
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    if (type === 'password') {
        return (
            <TextField
                {...rest}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                    ...InputProps,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        );
    }

    return <TextField {...props} />;
}
