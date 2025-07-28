/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Button, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material"
import { useFormValidationSchema } from "./validations/useFormValidations"
import { TYPE_ROUTER_NODE } from "../utils/constants"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect } from "react"
import { useState } from "react"
import RouteTableFormFullScreen from "./RouteTableFormFullScreen"
import { useNetwork } from "../../../contexts/NetworkNodesContext"



// eslint-disable-next-line react/prop-types, no-unused-vars, react-refresh/only-export-components
const RouterNodeForm = ({ nodeData, onSave, deleteNode, cidrBlockVPC }) => {

    const {nodes, edges} = useNetwork()

    const [openModalRouteTable, setOpenModalRouteTable] = useState(false)
    const validationSchema = useFormValidationSchema(TYPE_ROUTER_NODE, cidrBlockVPC)
    // console.log("NODES ROUTE NODE FORM: ", nodes);
    // console.log("NODES ROUTE EDGE FORM: ", edges);
    
    // console.log("RouterNodeForm: cidrBlockVPC->", cidrBlockVPC);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            internetGateway: nodeData?.internetGateway || false,
            natGateway: nodeData?.natGateway || false,
        }
    })

    // Efecto para actualizar el valor del formulario cuando nodeData cambie
    useEffect(() => {
        if (nodeData) {
            setValue('internetGateway', nodeData.internetGateway || false); // Actualiza el valor del checkbox
            setValue('natGateway', nodeData.natGateway || false);
            setValue('publicSubnet', nodeData.publicSubnet || '');
            setValue('elasticIp', nodeData.elasticIp || '');
        }
    }, [nodeData, setValue]);

    // Para ver el valor en tiempo real
    const internetGateway = watch('internetGateway'); // Obtenemos el valor actual del checkbox
    const natGateway = watch('natGateway');


    const onSubmit = (data) => {

        onSave(data)
    }
    const handleClickOpenRouteTableForm = () => {
        // console.log("hoal");
        setOpenModalRouteTable(!openModalRouteTable)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>

                <FormControlLabel
                    control={<Checkbox

                        {...register("internetGateway")}
                        checked={internetGateway} // El valor actual del checkbox
                        onChange={(e) => setValue('internetGateway', e.target.checked)}
                    />}
                    label="Internet Gateway"
                />


                <FormControlLabel
                    control={<Checkbox

                        {...register("natGateway")}
                        checked={natGateway} // El valor actual del checkbox
                        onChange={(e) => setValue('natGateway', e.target.checked)}
                    />}
                    label="Nat Gateway"
                />


                <Button type="submit" variant="contained" color="primary">
                    Registrar Configuración
                </Button>
                <Button onClick={deleteNode}>Delete Node</Button>
                <Button onClick={()=>{handleClickOpenRouteTableForm()}}>Open modal</Button>
            </Stack>
                    
               <RouteTableFormFullScreen handleOpenDialog ={handleClickOpenRouteTableForm} openModalRouteTable={openModalRouteTable} />
        </form>

    )

}

export default RouterNodeForm