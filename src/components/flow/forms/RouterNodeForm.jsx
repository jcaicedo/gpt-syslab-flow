// src/components/flow/forms/RouterNodeForm.jsx
/* eslint-disable react/prop-types */
import { Button, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFormValidationSchema } from "./validations/useFormValidations";
import { TYPE_ROUTER_NODE } from "../utils/constants";

const RouterNodeForm = ({
  nodeData = {},
  onSave,
  deleteNode,
  vlanRegion = "us-east-1", // pásala desde MainFlow para sugerir región
}) => {
  const schema = useFormValidationSchema(TYPE_ROUTER_NODE);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: nodeData.identifier || "router-1",
      region: nodeData.region || vlanRegion,
      internetGateway: !!nodeData.internetGateway,
      natGateway: !!nodeData.natGateway,
      description: nodeData.description || ""
    }
  });

  const onSubmit = (data) => onSave(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField
          label="Identifier"
          {...register("identifier")}
          error={!!errors.identifier}
          helperText={errors.identifier?.message}
          fullWidth
        />

        <TextField
          label="Region"
          {...register("region")}
          error={!!errors.region}
          helperText={errors.region?.message}
          fullWidth
        />

        <TextField
          label="Description"
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
          fullWidth
          multiline
          minRows={2}
        />

        <FormControlLabel
          control={<Checkbox {...register("internetGateway")} />}
          label="Internet Gateway"
        />
        <FormControlLabel
          control={<Checkbox {...register("natGateway")} />}
          label="NAT Gateway"
        />

        <Button type="submit" variant="contained">Guardar</Button>
        <Button onClick={deleteNode} color="error">Eliminar</Button>
      </Stack>
    </form>
  );
};

export default RouterNodeForm;
