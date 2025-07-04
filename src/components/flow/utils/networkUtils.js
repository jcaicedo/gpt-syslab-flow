import { Netmask } from "netmask";


/**
 * Verifica si un CIDR objetivo está contenido dentro del bloque CIDR principal.
 * @param {string} vpcCidr - El bloque CIDR principal (por ejemplo: '192.168.0.0/16')
 * @param {string} targetCidr - El bloque CIDR objetivo a validar
 * @returns {boolean}
 */
export const isCidrInVpcRange = (vpcCidr, targetCidr) => {

    if (
        !targetCidr ||
        typeof targetCidr !== 'string' ||
        !targetCidr.includes('/') ||
        !/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(targetCidr)
    ) {
        return false;
    }

    try {
        const vpcBlock = new Netmask(vpcCidr);
        const targetBlock = new Netmask(targetCidr);
        return vpcBlock.contains(targetBlock.base);

    }
    catch (error) {
        console.error("Error validating CIDR range:", error);
        return false;
    }
}

