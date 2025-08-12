import useClickedNodeIdStore from '../store/clickedNodeIdStore'
import { TYPE_ROUTER_NODE } from '../utils/constants';

const useNodeClick = (setSelectedNode, setModalIsOpen, setOpenRouteTableFullScreen) => {
    // eslint-disable-next-line no-unused-vars
    const setClickedNodeId = useClickedNodeIdStore(state => state.setClickedNodeId);
    const onNodeClick = (event, node) => {
        // console.log("NODE: ", node);

        setSelectedNode(node);
        setClickedNodeId(node.id);

        if (node.type === TYPE_ROUTER_NODE) {
            setOpenRouteTableFullScreen(true)
        } else {
            setModalIsOpen(true);
        }

    };

    return onNodeClick;
};

export default useNodeClick;
