/* eslint-disable react/prop-types */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { TYPE_SUBNETWORK_NODE } from "../utils/constants";
import { useFormValidationSchema } from './validations/useFormValidations';
import { useEffect } from 'react';
import { useNetwork } from '../../../contexts/NetworkNodesContext';


const SubNetworkNodeForm = ({ nodeData, onSave, deleteNode, cidrBlockVPC }) => {

    const { nodes } = useNetwork();
    const existingCidrs = nodes
        .filter(n => n.type === TYPE_SUBNETWORK_NODE && n.id !== nodeData.id)
        .map(n => n.data?.cidrBlock)
        .filter(Boolean);

        
    const validationSchema = useFormValidationSchema(
        TYPE_SUBNETWORK_NODE,
        cidrBlockVPC,
        null,
        { existingCidrs }
    );



    useEffect(() => {
        console.log("CIDRs existentes en context:", existingCidrs);
    }, []);



    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema, { context: { existingCidrs } }),
        defaultValues: {
            subnetName: nodeData.subnetName || '',
            cidrBlock: nodeData.cidrBlock || '',
            availabilityZone: nodeData.availabilityZone || '',
            // publicIp: nodeData.publicIp || '',
            route_table: nodeData.route_table || ''
        }
    });


    useEffect(() => {
        console.log("Errores del formulario:", errors);
    }, [errors]);

    const onSubmit = (data) => {
        console.log("Datos enviados:", data);
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
                <TextField
                    label="Name"
                    {...register("subnetName")}
                    error={!!errors.subnetName}
                    helperText={errors.subnetName?.message}
                />
                <TextField
                    label="CIDR Block"
                    {...register("cidrBlock")}
                    error={!!errors.cidrBlock}
                    helperText={errors.cidrBlock?.message}
                />
                <TextField
                    label="Availability Zone"
                    {...register("availabilityZone")}
                    error={!!errors.availabilityZone}
                    helperText={errors.availabilityZone?.message}
                />
                {/* <TextField
                    label="Public IP"
                    {...register("publicIp")}
                    error={!!errors.publicIp}
                    helperText={errors.publicIp?.message}
                /> */}
                <FormControl fullWidth error={!!errors.route_table}>
                    <InputLabel>Route Table</InputLabel>
                    <Controller
                        name="route_table"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} label="Route Table">
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                            </Select>
                        )}
                    />
                    {errors.route_table && (
                        <FormHelperText>{errors.route_table.message}</FormHelperText>
                    )}
                </FormControl>
                <Button type="submit" variant="contained" color="primary">
                    Registrar Configuración
                </Button>
                <Button onClick={deleteNode}>Delete Node</Button>
            </Stack>
        </form>
    );
};

export default SubNetworkNodeForm;
