/* eslint-disable react/prop-types */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { TYPE_SUBNETWORK_NODE } from "../utils/constants";
import { useFormValidationSchema } from './validations/useFormValidations';
import { useEffect } from 'react';
import { useNetwork } from '../../../contexts/NetworkNodesContext';


const SubNetworkNodeForm = ({
    nodeData,
    onSave,
    deleteNode,
    parentVpcCidr,                  // <-- NUEVO (CIDR completo del padre VPC-hija)
    siblingSubnetCidrsInSameVpc = []// <-- NUEVO

}) => {
    // descompone el CIDR del padre para el hook (base + prefijo)

    const [vpcBase, vpcPrefixStr] = (parentVpcCidr || "").split("/");
    const vpcPrefix = vpcPrefixStr ? Number(vpcPrefixStr) : null;

    const validationSchema = useFormValidationSchema(
        TYPE_SUBNETWORK_NODE,
        vpcBase, // <-- pasa base del CIDR del padre
        vpcPrefix, // <-- pasa prefijo del CIDR del padre
        { existingCidrs: siblingSubnetCidrsInSameVpc }, // <-- pasa lista de CIDRs existentes
        true // activa validación CIDR      
    )

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            subnetName: nodeData.subnetName || "",
            cidrBlock: nodeData.cidrBlock || "",
            availabilityZone: nodeData.availabilityZone || "",
            route_table: nodeData.route_table || ""
        }
    });

    const onSubmit = (data) => {
        console.log("OnSubmit  subNetwork data:", data);
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                label="Subnet Name"
                {...register("subnetName")}
                error={!!errors.subnetName}
                helperText={errors.subnetName?.message}
                fullWidth
                margin="normal"
            />
            <TextField
                label={`Subnet's CIDR Block (inside  ${parentVpcCidr || 'VPC'})`}
                {...register("cidrBlock")}
                error={!!errors.cidrBlock}
                helperText={errors.cidrBlock?.message}
                placeholder="10.0.1.0/26"
                fullWidth
                margin="normal"

            />
            <TextField
                label="Availability Zone"
                {...register("availabilityZone")}
                error={!!errors.availabilityZone}
                helperText={errors.availabilityZone?.message}
                fullWidth
                margin="normal"
            />

            <FormControl fullWidth margin="normal">
                <InputLabel id="rt-label">Route Table Type</InputLabel>
                <Select
                    labelId="rt-label"
                    {...register("route_table")}
                    label="Route Table Type"
                    defaultValue="private"
                >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                </Select>
                 {errors.route_table && <p>{errors.route_table.message}</p>}
            </FormControl>
           

            <Button type="submit" variant="contained" color="primary">
                Registrar Configuración
            </Button>
            <Button onClick={deleteNode} sx={{ ml: 1 }}>Delete Node</Button>

        </form>
    );
};

export default SubNetworkNodeForm;
