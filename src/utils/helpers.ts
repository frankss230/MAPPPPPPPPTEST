import CryptoJS from 'crypto-js';
// import { compare, genSalt, hash } from 'bcrypt';

export const encrypt = (data: string) => {
    const hexencrypt = CryptoJS.AES.encrypt(data, process.env.CRYPTOJS_SECRET_KEY as string).toString();
    return encodeURIComponent(hexencrypt)
}

export const decrypt = (data: string) => {
    const hexdecrypt = decodeURIComponent(data)
    console.log("🚀 ~ decrypt ~ hexdecrypt:", hexdecrypt)
    return CryptoJS.AES.decrypt(hexdecrypt, process.env.CRYPTOJS_SECRET_KEY as string).toString(CryptoJS.enc.Utf8);
}

export const parseQueryString = (queryString: string) => {
    const params: { [key: string]: string } = {};
    const queries = queryString.split('&');
    queries.forEach((indexQuery) => {
        const indexPair = indexQuery.split('=');
        params[indexPair[0]] = indexPair[1];
    });
    return params;
}

// export const hashPassword = async (password: string): Promise<string> => {
//     const salt = await genSalt(8);
//     return hash(password, salt);
// };

// export const matchPassword = async (oldPassword: string, password: string): Promise<boolean> => {
//     return compare(password, oldPassword);
// };