import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormValidationSchema } from "./validations/useFormValidations";
import { CLOUD_AWS_LABEL, CLOUD_AWS_VALUE, VPC_FORM } from "../utils/constants";

// eslint-disable-next-line react/prop-types
const VPCNodeForm = ({ nodeData, onSave, deleteNode }) => {
  const validationSchema = useFormValidationSchema(VPC_FORM, true);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      cloudProvider: nodeData.cloudProvider || CLOUD_AWS_VALUE,
      vpcName: nodeData.vpcName || "",
      cidrBlock: nodeData.cidrBlock && nodeData.prefixLength ? `${nodeData.cidrBlock}/${nodeData.prefixLength}` : "",
    }
  });

  const onSubmit = (data) => {
    const [base, prefix] = data.cidrBlock.split("/");
    onSave({ ...data, cidrBlock: base, prefixLength: prefix });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl fullWidth>
        <InputLabel id="vpc-cloud-label">Cloud Provider</InputLabel>
        <Select
          labelId="vpc-cloud-label"
          {...register("cloudProvider")}
          label="Cloud Provider"
          defaultValue={CLOUD_AWS_VALUE}
        >
          <MenuItem value={CLOUD_AWS_VALUE}>{CLOUD_AWS_LABEL}</MenuItem>
        </Select>
        {errors.cloudProvider && <p>{errors.cloudProvider.message}</p>}
      </FormControl>

      <TextField
        label="Nombre de la VPC"
        {...register("vpcName")}
        error={!!errors.vpcName}
        helperText={errors.vpcName?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="CIDR Block (ej: 192.168.0.0/24)"
        {...register("cidrBlock")}
        error={!!errors.cidrBlock}
        helperText={errors.cidrBlock?.message}
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary">
        Registrar Configuración
      </Button>
      <Button onClick={deleteNode}>Delete Node</Button>
    </form>
  );
};

export default VPCNodeForm;
