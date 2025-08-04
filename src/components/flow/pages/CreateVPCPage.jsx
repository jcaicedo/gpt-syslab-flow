import { addDoc, collection } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseConfig'
import { Box, Typography } from '@mui/material'
import NewVPCForm from '../forms/NewVPCForm'
import { useContext } from 'react'
import { LoadingFlowContext } from '../../../contexts/LoadingFlowContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import useCidrBlockVPCStore from '../store/cidrBlocksIp'
import { DB_FIRESTORE_VPCS } from '../../../constants'

const CreateVPCPage = () => {
    const { setLoadingFlow } = useContext(LoadingFlowContext)
    const { user } = useAuth()
    const userId = user.userId
    const navigate = useNavigate()
    const { setCidrBlockVPC, setPrefixLength } = useCidrBlockVPCStore()

    const handleCreateVPC = async (vpcData) => {
        setLoadingFlow(true)
        const { vpcName, cloudProvider, cidrBlock, prefixLength } = vpcData
        if (vpcName && cloudProvider && cidrBlock && prefixLength) {
            try {
                const vpcDoc = await addDoc(collection(db, DB_FIRESTORE_VPCS), {
                    name: vpcName,
                    cloudProvider,
                    cidrBlock,
                    userId,
                    prefixLength
                })
                setCidrBlockVPC(cidrBlock)
                setPrefixLength(prefixLength)
                navigate(`/admin/vpcs/${vpcDoc.id}/mainflow`)
            } catch (error) {
                // console.log(error)
            } finally {
                setLoadingFlow(false)
            }
        } else {
            setLoadingFlow(false)
        }
    }

    return (
        <Box>
            <Typography variant="h4" sx={{
                color:(theme) => theme.palette.primary.main
            }}>
                Crear Nueva VPC
            </Typography>
            <NewVPCForm onSave={handleCreateVPC} />
        </Box>
    )
}

export default CreateVPCPage

