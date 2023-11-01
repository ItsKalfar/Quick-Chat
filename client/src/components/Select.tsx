import { FC, useState, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Combobox } from "@headlessui/react";

interface SelectProps {
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: { value: string; label: string }) => void;
  placeholder: string;
}

export const SelectItem: FC<SelectProps> = ({
  options,
  placeholder,
  onChange,
  value,
}) => {
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  return (
    <Combobox
      className={"w-full"}
      as="div"
      value={options.find((o) => o.value === value)}
      onChange={(val: any) => onChange(val)}
    >
      <div className="relative mt-2">
        <Combobox.Button className="w-full">
          <Combobox.Input
            placeholder={placeholder}
            className="w-full border-gray-700 border-2 rounded px-2.5 py-2 bg-transparent disabled:opacity-[0.5] focus:outline-none focus:border-gray-300 text-white focus:bg-transparent"
            onChange={(e) => {
              setLocalOptions(
                options.filter((op) => op.label.includes(e.target.value))
              );
            }}
            displayValue={(option: (typeof options)[0]) => option?.label}
          />
        </Combobox.Button>
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronsUpDown
            className="h-5 w-5 text-zinc-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {localOptions.length > 0 && (
          <Combobox.Options className="bg-gray-700 absolute z-10 mt-2 p-2 max-h-60 w-full overflow-y-auto text-base focus:outline-none sm:text-sm rounded">
            {localOptions.map((option) => {
              return (
                <Combobox.Option
                  key={option.value}
                  value={option}
                  className={({ active }) =>
                    `cursor-pointer relative rounded-2xl select-none py-4 pl-3 pr-9 ${
                      active ? "bg-dark text-white" : "text-white"
                    }`
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span
                        className={`
                        block truncate
                        ${selected ? "font-semibold" : ""}
                      `}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4",
                         ${active ? "text-white" : "text-indigo-600"}
                        `}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              );
            })}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};
