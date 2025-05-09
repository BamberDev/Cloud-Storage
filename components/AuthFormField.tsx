import { FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export default function AuthFormField<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  customComponent,
  onInputChange,
}: AuthFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="shad-form-item">
            <FormLabel className="shad-form-label">{label}</FormLabel>
            <FormControl>
              {customComponent ? (
                customComponent
              ) : (
                <Input
                  placeholder={placeholder}
                  className="shad-input"
                  type={type}
                  disabled={disabled}
                  {...(type === "email" && { autoComplete: "email" })}
                  {...(type === "username" && { autoComplete: "username" })}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (onInputChange) onInputChange();
                  }}
                />
              )}
            </FormControl>
          </div>
          <FormDescription className="sr-only">{label} input</FormDescription>
          <FormMessage className="shad-form-message" />
        </FormItem>
      )}
    />
  );
}
