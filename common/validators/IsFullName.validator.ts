import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFullName', async: false })
export class IsFullName implements ValidatorConstraintInterface {
  validate(fullName: string, args: ValidationArguments) {
    return /^[A-Za-z\s]+$/.test(fullName); // Example validation logic: allow only alphabets and spaces
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only alphabets and spaces`;
  }
}
