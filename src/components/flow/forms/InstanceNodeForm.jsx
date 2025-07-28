/* eslint-disable react/prop-types */
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useFormValidationSchema } from './validations/useFormValidations';
import { TYPE_INSTANCE_NODE } from "../utils/constants";
import { useNetwork } from "../../../contexts/NetworkNodesContext";

// Extract form logic and UI rendering from instance node form
const InstanceNodeForm = ({ nodeData, onSave, amiList, deleteNode, cidrBlockVPC }) => {

    const { nodes } = useNetwork();

    const parentSubnet = nodes.find(n => n.id === nodeData.parentId);
    const subnetCidr = parentSubnet?.data?.cidrBlock || null;



    const existingIps = nodes
        .filter(n =>
            ["computer", "printer", "server"].includes(n.type) &&
            n.id !== nodeData.id &&
            n.parentId === nodeData.parentId // compara solo con instancias dentro de la misma subred
        )
        .map(n => n.data?.ipAddress)
        .filter(Boolean);



    const validationSchema = useFormValidationSchema(TYPE_INSTANCE_NODE, subnetCidr, null, { existingIps });


    // Initialize react-hook-form with yup validation
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            ami: nodeData.ami || '',
            instanceType: nodeData.instanceType || '',
            ipAddress: nodeData.ipAddress || '',
            name: nodeData.name || '',
            sshAccess: nodeData.sshAccess || ''
        }
    });

    const onSubmit = (data) => {
        // console.log(data);
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="ami-select-label">Ami</InputLabel>
                    <Select
                        labelId="ami-select-label"
                        {...register("ami")}
                        label="Ami"
                        defaultValue={nodeData.ami || ''}
                    >
                        {amiList.map((amiItem) => (
                            <MenuItem key={amiItem.id} value={amiItem.data.amiCode}>
                                {amiItem.data.amiCode}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.ami && <p>{errors.ami.message}</p>}
                </FormControl>

                <TextField
                    label="Instance Type"
                    {...register("instanceType")}
                    placeholder="Set Instance Type"
                    error={!!errors.instanceType}
                    helperText={errors.instanceType?.message}
                />
                <TextField
                    label="Ip Address"
                    {...register("ipAddress")}
                    placeholder="Set Ip Address"
                    error={!!errors.ipAddress}
                    helperText={errors.ipAddress?.message}
                />
                <TextField
                    label="Name"
                    {...register("name")}
                    placeholder="Set Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <TextField
                    label="ssh Access"
                    {...register("sshAccess")}
                    placeholder="Set ssh Access"
                    error={!!errors.sshAccess}
                    helperText={errors.sshAccess?.message}
                />

                <Button type="submit">Registrar Configuración</Button>
                <Button onClick={deleteNode}>Delete Node</Button>
            </Stack>
        </form>
    );
};

export default InstanceNodeForm;
