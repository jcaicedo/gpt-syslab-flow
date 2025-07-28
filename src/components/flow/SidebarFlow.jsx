import { Box, Typography, Grid, Card } from '@mui/material'
import { TITLE_COMPUTER, TITLE_PRINT, TITLE_ROUTER, TITLE_SERVER, TITLE_SUBNETWORK, TYPE_COMPUTER_NODE, TYPE_PRINTER_NODE, TYPE_ROUTER_NODE, TYPE_SERVER_NODE, TYPE_SUBNETWORK_NODE, TYPE_VPC_NODE } from './utils/constants'


const SidebarFlow = () => {

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("application/reactflow", nodeType)
        event.dataTransfer.effectAllowed = "move"
    }
    // // console.log(onDragStart);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" textAlign={"center"} sx={{ mb: 3 }}>
                INSTANCES
            </Typography>
            <Grid container>
                <Grid item xs={12}> <Card
                    draggable
                    onDragStart={e => onDragStart(e, TYPE_VPC_NODE)}
                    sx={{ display: "flex", background: '#0B8068', color: 'white', alignItems: "center", p: 3 }}
                >
                    VPC
                </Card></Grid>
                <Grid item xs={12}>
                    <Card
                        onDragStart={(event) => onDragStart(event, TYPE_SUBNETWORK_NODE)}
                        draggable
                        sx={{ display: "flex", alignItems: "center", p: 3 }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{TITLE_SUBNETWORK}</Box>
                    </Card>

                </Grid>
                <Grid item xs={12}>
                    <Card
                        onDragStart={(event) => onDragStart(event, TYPE_COMPUTER_NODE)}
                        draggable
                        sx={{ display: "flex", alignItems: "center", p: 3 }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{TITLE_COMPUTER}</Box>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card
                        onDragStart={(event) => onDragStart(event, TYPE_PRINTER_NODE)}
                        draggable
                        sx={{ display: "flex", alignItems: "center", p: 3 }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{TITLE_PRINT}</Box>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card
                        onDragStart={(event) => onDragStart(event, TYPE_SERVER_NODE)}
                        draggable
                        sx={{ display: "flex", alignItems: "center", p: 3 }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{TITLE_SERVER}</Box>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card
                        onDragStart={(event) => onDragStart(event, TYPE_ROUTER_NODE)}
                        draggable
                        sx={{ display: "flex", alignItems: "center", p: 3 }}
                    >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{TITLE_ROUTER}</Box>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    )
}

export default SidebarFlow