import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#121212',
        },
        secondary: {
            main: '#2461C2'
        },
        background: {
            default: '#ffffff'
        }
    },
    components: {
        MuiToolbar: {
            styleOverrides: {
                root: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: '0 8px',
                    backgroundColor: '#233044'
                }
            }
        },
        MuiList: {
            styleOverrides: {
                root: {
                    backgroundColor: '#233044'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                }
            },
            variants:[
                {
                    props:{variant:'lightPaper'},
                    style:{
                        backgroundColor:'#ffffff',
                        boxShadow:'rgba(0, 0, 0, 0.04) 0px 5px 22px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
                        borderRadius:'20px'
                    }
                }
            ]
        },
        MuiListItemButton:{
            variants:[
                {
                    props:{variant:'whiteStyle'},
                    style:{
                        color:'#ffffff'
                    }
                }
            ]
        },
        MuiListItemIcon:{
            variants:[
                {
                    props:{variant:'whiteStyle'},
                    style:{
                        color:'#ffffff'
                    }
                }
            ]
        }
    }
})

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#ff4081',
        },
        background: {
            default: '#fafafa',
        },
    },
})