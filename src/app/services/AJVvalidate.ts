import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
    removeAdditional: "all",
    strict: false,
    allErrors: true,
});

addFormats(ajv);
ajv.addFormat("email", (data: string) => {
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(data)) { return false; }

    const tld = data.split(".").pop();
    return tld && tld.length >= 2 && tld.length <= 6;
});
ajv.addFormat("password", /^.{6,}$/);
ajv.addFormat("binary", /.*/);
ajv.addFormat("integer", /^\d+$/);
ajv.addFormat("boolean", /^(true|false)$/i);
ajv.addFormat("datetime", /^\d\d\d\d-\d\d?-\d\d? \d\d?:\d\d?:\d\d?$/);

const AJVvalidate = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = validator(data);

        if (!valid) {
            return ajv.errorsText(validator.errors);
        }

        return true;
    } catch (err) {
        return err.message;
    }
};

export { AJVvalidate };
