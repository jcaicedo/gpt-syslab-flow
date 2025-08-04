/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "../../../firebase/firebaseConfig";
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { DeleteOutline } from "@mui/icons-material";
import { ModeEditOutlined } from "@mui/icons-material";
import { useContext } from "react";
import { LoadingFlowContext } from "../../../contexts/LoadingFlowContext";
import useCidrBlockVPCStore from '../store/cidrBlocksIp'
import { useCallback } from "react";
import { DB_FIRESTORE_VPCS, USER_ROL_STUDENT } from "../../../constants";
import { useAuth } from "../../../contexts/AuthContext";



const useFetchVPCs = (setLoadingFlow) => {
    const [vpcs, setVpcs] = useState([])
    const { user } = useAuth()
    const { role, userId } = user || {}




    const fetchVPCs = useCallback(async () => {
        setLoadingFlow(true)
        // console.log("user:", user);
        try {
            let vpcList = []
            if (role === USER_ROL_STUDENT) {
                vpcList = await fetchStudentVPCs(userId)
            } else {
                vpcList = await fetchAllVPCs()
            }

            setVpcs(vpcList)




        } catch (error) {
            // console.log("Error fetching VPCs: ", error);

        } finally {
            setLoadingFlow(false)
        }
    }, [setLoadingFlow, userId, role])

    useEffect(() => {
        fetchVPCs()
    }, [fetchVPCs])

    return { vpcs, fetchVPCs }
}

const fetchStudentVPCs = async (userId) => {

    const vpcStudesCollectionRef = collection(db, DB_FIRESTORE_VPCS)
    const q = query(vpcStudesCollectionRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
        console.warn('No se encontraron registros para el estudiante');
        return []
    }

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

}

const fetchAllVPCs = async () => {
    const vpcCollection = collection(db, DB_FIRESTORE_VPCS)
    const vpcSnapshot = await getDocs(vpcCollection)
    return vpcSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
}


const VPCList = () => {
    const navigate = useNavigate()
    const { setLoadingFlow } = useContext(LoadingFlowContext)
    const { setCidrBlockVPC } = useCidrBlockVPCStore();

    const { vpcs } = useFetchVPCs(setLoadingFlow)

    const handleLinkToFlow = (newVPCId, ipVPC) => {
        setLoadingFlow(true)
        setCidrBlockVPC(ipVPC)
        setLoadingFlow(false)
        navigate(`/admin/vpcs/${newVPCId}/mainflow`);
    }

    const handleNavigateToCreate = () => {
        navigate('/admin/vpcs/new');
    }


    return (
        <div>
            <Stack direction="column"
                spacing={4}>
                <Stack direction="row">
                    <Box flexGrow={1} flexShrink={1} flexBasis="auto">
                        <Typography variant="h4" sx={{
                            color:(theme) => theme.palette.primary.main
                        }}>
                            Lista de VPCs
                        </Typography>
                    </Box>
                    <div>
                        <Button variant="contained" startIcon={<AddIcon/>} onClick={handleNavigateToCreate} color="secondary">
                            Add new vpc
                        </Button>
                    </div>

                </Stack>
                <VPCsTable vpcs={vpcs} onEdit={handleLinkToFlow} />
            </Stack>
        </div>
    )
}

const VPCsTable = ({ vpcs, onEdit }) => (

    <TableContainer component={Paper} variant="lightPaper">
        <Table sx={{ minWidth: 650 }} aria-label="vpcs table">
            <TableHead>
                <TableRow>
                    <TableCell>VPC Name</TableCell>
                    <TableCell>VPC ID</TableCell>
                    <TableCell>VPC TYPE</TableCell>
                    <TableCell>VPC Status</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {vpcs.map(vpc => (
                    <TableRow
                        key={vpc.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            {vpc.name}
                        </TableCell>
                        <TableCell >{vpc.id}</TableCell>
                        <TableCell >{vpc.cloudType}</TableCell>
                        <TableCell >Active</TableCell>
                        <TableCell >
                            <Stack direction="row" spacing={1}>
                                {/* <IconButton component={Link} to={`/admin/vpcs/${vpc.id}/mainflow`} aria-label="edit" color="primary">
                                <ModeEditOutlined />
                            </IconButton> */}
                                <IconButton onClick={() => onEdit(vpc.id, vpc.cidrBlock)} aria-label="edit" color="primary">
                                    <ModeEditOutlined />
                                </IconButton>
                                <IconButton aria-label="delete" color="error" >
                                    <DeleteOutline />
                                </IconButton>
                            </Stack>

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>

        </Table>
    </TableContainer>
)


export default VPCList
