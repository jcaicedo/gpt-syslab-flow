import * as yup from 'yup';

export const useRegistrationUserFormValidation = () => {
    return yup.object({
        email: yup.string().email('Invalid email format').required('Email is required'),
        password: yup.string()
            .required('No password provided.')
            .min(8, 'Password is too short - should be 8 chars minimum.')
            .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.')
    }).required()
}