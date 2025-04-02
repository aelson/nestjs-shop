import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function MaxBase64Size(maxSizeInMB: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxBase64Size',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string' || !value.startsWith('data:')) {
            return false;
          }

          // Calculate the size of the base64 data in MB
          // Remove header information (data:image/jpeg;base64,)
          const base64Data = value.split(',')[1];
          if (!base64Data) return false;

          // Base64 size calculation: 3/4 * length
          const sizeInBytes = (base64Data.length * 3) / 4;
          const sizeInMB = sizeInBytes / (1024 * 1024);

          return sizeInMB <= maxSizeInMB;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a base64 data URL with size less than ${maxSizeInMB}MB`;
        },
      },
    });
  };
}
