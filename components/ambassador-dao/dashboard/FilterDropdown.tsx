import * as Select from "@radix-ui/react-select";

interface FilterDropdownProps {
  label: string;
  options: any;
  onValueChange?: (value: string) => void;
  value?: string;
}

export const FilterDropdown = ({
  label,
  options,
  onValueChange,
  value,
}: FilterDropdownProps) => {
  return (
    <Select.Root onValueChange={onValueChange} value={value}>
      <Select.Trigger
        className='text-sm focus:outline-none h-10 flex items-center justify-between border border-[var(--default-border-color)] text-[var(--white-text-color)] rounded-md px-2 outline-none data-[placeholder]:text-[var(--secondary-text-color)]'
        aria-label={label}
      >
        <Select.Value placeholder={label} />
        <Select.Icon>
          <svg
            className='w-4 h-4 text-[var(--secondary-text-color)]'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className='bg-[#fff] dark:bg-[#000] text-[var(--white-text-color)] rounded-md shadow-xl overflow-hidden z-50'
          position='popper'
          sideOffset={5}
        >
          <Select.ScrollUpButton className='flex items-center justify-center h-6 bg-gray-800 text-[var(--secondary-text-color)] cursor-default'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M8 4L4 8H12L8 4Z' fill='currentColor' />
            </svg>
          </Select.ScrollUpButton>

          <Select.Viewport className='p-1'>
            <Select.Group>
              {options?.map((option: any, index: number) => (
                <Select.Item
                  key={index}
                  value={option.id}
                  className='relative flex items-center px-6 py-2 rounded hover:bg-gray-200 dark:hover:bg-[#27272A] focus:outline-none select-none data-[highlighted]:bg-gray-white data-[highlighted]:outline-none'
                >
                  <Select.ItemText>
                    {option?.label || option?.name}
                  </Select.ItemText>
                  <Select.ItemIndicator className='absolute left-1 inline-flex items-center'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 16 16'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M13.3334 4L6.00008 11.3333L2.66675 8'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className='flex items-center justify-center h-6 bg-gray-800 text-[var(--secondary-text-color)] cursor-default'>
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M8 12L12 8H4L8 12Z' fill='currentColor' />
            </svg>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
