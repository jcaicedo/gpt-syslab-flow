import { Netmask } from "netmask";


/**
 * Verifica si un CIDR objetivo está completamente contenido dentro del CIDR padre.
 * @param {string} parentCidr - e.g. '10.0.0.0/16' (VLAN o VPC)
 * @param {string} targetCidr - e.g. '10.0.1.0/24'
 * @returns {boolean}
 */
export const isCidrInVpcRange = (parentCidr, targetCidr) => {

    if (
        !targetCidr ||
        typeof targetCidr !== 'string' ||
        !targetCidr.includes('/') ||
        !/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(targetCidr)
    ) {
        return false;
    }

    try {
        const parent = new Netmask(parentCidr);
        const child = new Netmask(targetCidr);

        //Se asegura contención completa del bloque, no solo la base
        return parent.contains(child.base) && parent.contains(child.broadcast);
    }
    catch (error) {
        console.error("Error validating CIDR range:", error);
        return false;
    }
}

export const overlapsCidrs = (cidrA, cidrB) => {
    try {
        const a = new Netmask(cidrA), b = new Netmask(cidrB);
        return !(a.broadcast < b.base || b.broadcast < a.base);
    } catch (error) {
        console.error("Error checking CIDR overlap:", error);
        return true;
    }
}

export const overlapsAny = (targetCidr, list=[]) =>
  list.some(c => overlapsCidrs(targetCidr, c));

export const ipInCidr = (ip, cidr) => {
    try { return new Netmask(cidr).contains(ip); } catch { return false; }
}





