import * as yup from 'yup';
import { Netmask } from 'netmask';
import { TYPE_COMPUTER_NODE, TYPE_INSTANCE_NODE, TYPE_PRINTER_NODE, TYPE_ROUTER_NODE, TYPE_SERVER_NODE, TYPE_SUBNETWORK_NODE, VPC_FORM } from '../../utils/constants';
import { isCidrInVpcRange } from '../../utils/networkUtils';

const ipRegex = /^(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1?[0-9]?[0-9])$/;
const cidrRegex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\/(\d|[1-2]\d|3[0-2])$/;

const isCidrValid = (value) => {
  try {
    const block = new Netmask(value);
    return !!block;
  } catch (err) {
    return false;
  }
};

export const useFormValidationSchema = (formType, cidrBlockVPC = null, prefixLength = null, context = {}) => {
  const fullVpcCidr = cidrBlockVPC && prefixLength ? `${cidrBlockVPC}/${prefixLength}` : null;

  switch (formType) {
    case VPC_FORM:
      return yup.object({
        cloudProvider: yup.string().required("Cloud Provider is required"),
        vpcName: yup.string()
          .required("Name VPC is required")
          .matches(/^[a-zA-Z]+$/, "VPC name must contain only letters"),
        cidrBlock: yup.string()
          .required("CIDR Block is required")
          .matches(cidrRegex, 'CIDR Block must be in format 192.168.0.0/24')
          .test('is-valid-cidr', 'CIDR block is invalid', value => isCidrValid(value))
      }).required();

    case TYPE_SUBNETWORK_NODE:
      return yup.object({
        subnetName: yup.string().required("Name is required"),
        cidrBlock: yup.string()
          .required("CIDR Block is required")
          .matches(cidrRegex, 'CIDR Block must be a valid CIDR (ej: 192.168.1.0/24)')
          .test('in-range', `CIDR Block must be within the VPC range ${fullVpcCidr}`, function (value) {
            if (!value || !fullVpcCidr) return true;
            return isCidrInVpcRange(fullVpcCidr, value);
          })
          .test('not-duplicate', 'CIDR already used by another subnet', function (value) {
            if (!value || !context.existingCidrs) return true;
            return !context.existingCidrs.includes(value.trim());
          }),
        availabilityZone: yup.string().required("Zone is required"),
        route_table: yup.string()
          .required("Public or Private is required")
          .oneOf(["public", "private"], "Invalid Route Table Type")
      }).required();

    case TYPE_COMPUTER_NODE:
    case TYPE_PRINTER_NODE:
    case TYPE_SERVER_NODE:
    case TYPE_INSTANCE_NODE:
      return yup.object({
        ami: yup.string().required("AMI is required"),
        instanceType: yup.string().required("Instance type is required"),
        ipAddress: yup.string()
          .required("IP Address is required")
          .matches(ipRegex, 'IP Address must be a valid IP (0-255 in each segment)')
          .test('is-subnet', function (value) {
            if (!value || !cidrBlockVPC) return true;
            try {
              const block = new Netmask(cidrBlockVPC);
              const isValid = block.contains(value);
              if (!isValid) {
                return this.createError({
                  message: `The IP address ${value} is not within the subnet range ${cidrBlockVPC}`
                });
              }
              return true;
            } catch (err) {
              return this.createError({ message: 'Invalid subnet format' });
            }
          })
          .test('not-duplicate', 'This IP address is already used in this subnet', function (value) {
            if (!value || !context.existingIps) return true;
            return !context.existingIps.includes(value.trim());
          }),
        name: yup.string().required("Name is required"),
        sshAccess: yup.string().required("SSH Access is required")
      }).required();

    case TYPE_ROUTER_NODE:
      return yup.object({
        internetGateway: yup.boolean(),
        natGateway: yup.boolean(),
      }).required();

    default:
      return yup.object().shape({});
  }
};
