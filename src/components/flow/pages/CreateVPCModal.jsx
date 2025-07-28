import { addDoc, collection } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseConfig'
import { Box, Modal} from '@mui/material'
import NewVPCForm from '../forms/NewVPCForm';
import { useContext } from 'react';
import { LoadingFlowContext } from '../../../contexts/LoadingFlowContext';
import { useAuth } from '../../../contexts/AuthContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

// eslint-disable-next-line react/prop-types
const CreateVPCModal = ({ open, onClose }) => {
    const{setLoadingFlow,loadingFlow} = useContext(LoadingFlowContext)
    const {user} = useAuth()
    const userId= user.userId

    const handleCreateVPC = async (vpcData) => {
       // console.log("loadingFlow",loadingFlow);
       
        setLoadingFlow(true)
        const {vpcName,cloudProvider, cidrBlock, prefixLength} = vpcData
        
        if (vpcName && cloudProvider && cidrBlock, prefixLength) {

            try {
                const vpcDoc = await addDoc(collection(db, 'vpcs'), {
                    name: vpcName,
                    cloudProvider,
                    cidrBlock,
                    userId,
                    prefixLength
                })
                onClose(vpcDoc.id, cidrBlock, prefixLength)
            } catch (error) {
                // console.log(error);
            }
            
        }else{
            // console.log("Error: Missing VPC name or cloud type")
        }
    }

  

    return (
        <Modal
            open={open}
            onClose={() => onClose()}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >

            <Box sx={{ ...style, width: 400 }}>
                <NewVPCForm onSave={handleCreateVPC}/>
                {/* <h2>Crear Nueva VPC</h2>
                <TextField
                    label="Nombre de la VPC"
                    value={vpcName}
                    onChange={(e) => setVPCName(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Select
                    value={cloudType}
                    onChange={(e) => setCloudType(e.target.value)}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="AWS">AWS</MenuItem>
                    <MenuItem value="GCP" >GCP</MenuItem>
                </Select>
                <Button onClick={handleCreateVPC} variant='contained' color='primary' >
                    Crear VPC
                </Button> */}
            </Box>
        </Modal>
    )
}

export default CreateVPCModal