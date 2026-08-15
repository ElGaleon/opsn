import * as React from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { cn } from "../../lib/utils";

type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<
  React.ComponentProps<"select">,
  "onChange"
> & {
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      name,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const hiddenRef = React.useRef<HTMLSelectElement | null>(null);
    const options = React.useMemo(() => getOptions(children), [children]);
    const initialValue = String(value ?? defaultValue ?? options[0]?.value ?? "");
    const [selectedValue, setSelectedValue] = React.useState(initialValue);

    React.useEffect(() => {
      if (value !== undefined) setSelectedValue(String(value));
    }, [value]);

    React.useEffect(() => {
      if (value === undefined && hiddenRef.current) {
        setSelectedValue(hiddenRef.current.value);
      }
    }, []);

    function setHiddenRef(node: HTMLSelectElement | null) {
      hiddenRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }

    function handleValueChange(nextValue: string | null) {
      if (nextValue === null) return;
      setSelectedValue(nextValue);
      if (hiddenRef.current) hiddenRef.current.value = nextValue;
      onChange?.({
        target: hiddenRef.current,
        currentTarget: hiddenRef.current,
      } as React.ChangeEvent<HTMLSelectElement>);
    }

    return (
      <>
        <select
          ref={setHiddenRef}
          className="hidden"
          name={name}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          {...props}
        >
          {children}
        </select>
        <ShadcnSelect
          value={selectedValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full rounded-md border-emerald-950/10 bg-white/90 px-3 text-stone-900 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-100",
              className,
            )}
          >
            <SelectValue>
              {(currentValue) =>
                options.find((option) => option.value === currentValue)
                  ?.label ?? ""
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </ShadcnSelect>
      </>
    );
  },
);

Select.displayName = "Select";

function getOptions(children: React.ReactNode): Option[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<React.ComponentProps<"option">>(child)) return [];
    return [
      {
        value: String(child.props.value ?? ""),
        label:
          typeof child.props.children === "string"
            ? child.props.children
            : String(child.props.children ?? ""),
        disabled: child.props.disabled,
      },
    ];
  });
}
