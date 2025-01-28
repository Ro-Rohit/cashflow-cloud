import React, { useMemo } from 'react';
import { SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface Props {
  isLoading?: boolean;
  isDisabled?: boolean;
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  value?: string | null | undefined;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

const SelectInput = ({
  onChange,
  isLoading,
  isDisabled,
  onCreate,
  value,
  placeholder,
  options,
}: Props) => {
  const onSelect = (option: SingleValue<{ label: string; value: string }>) => {
    onChange(option?.value);
  };

  const formattedValue = useMemo(() => {
    return options?.find((option) => option.value === value);
  }, [options, value]);
  return (
    <CreatableSelect
      className="text-sm h-10"
      isDisabled={isDisabled}
      isLoading={isLoading}
      onCreateOption={onCreate}
      onChange={onSelect}
      value={formattedValue}
      isClearable
      options={options}
      placeholder={placeholder}
      styles={{
        control: (base, _) => ({
          ...base,
          borderColor: '',
          backgroundColor: 'transparent',
          ':hover': {
            borderColor: '',
          },
        }),
        option: (base, _) => ({
          ...base,
          backgroundColor: 'transparent',
          color: 'black',
        }),
      }}
    />
  );
};

export default SelectInput;
