import { useEffect, useContext } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { LoadingFlowContext } from "../../../contexts/LoadingFlowContext";
import { useAuth } from "../../../contexts/AuthContext";
import useCidrBlockVPCStore from "../store/cidrBlocksIp";

const VPCNew = () => {
    const navigate = useNavigate();
    const { setLoadingFlow } = useContext(LoadingFlowContext);
    const { user } = useAuth();
    const { setCidrBlockVPC, setPrefixLength } = useCidrBlockVPCStore();

    useEffect(() => {
        const createVPC = async () => {
            setLoadingFlow(true);
            try {
                const vpcDoc = await addDoc(collection(db, "vpcs"), {
                    name: "New VPC",
                    cloudProvider: "AWS",
                    cidrBlock: "",
                    userId: user?.userId,
                    prefixLength: ""
                });
                setCidrBlockVPC("");
                setPrefixLength("");
                navigate(`/admin/vpcs/${vpcDoc.id}/mainflow`);
            } catch (error) {
                console.error("Error creating VPC:", error);
            } finally {
                setLoadingFlow(false);
            }
        };
        createVPC();
    }, [navigate, setLoadingFlow, user, setCidrBlockVPC, setPrefixLength]);

    return null;
};

export default VPCNew;
