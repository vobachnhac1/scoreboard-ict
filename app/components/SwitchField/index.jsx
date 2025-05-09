import React from "react";
import { Switch } from "@headlessui/react";
import classNames from "classnames";

export function SwitchField({ disabled = false, label, value, onChange, id }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <Switch
        disabled={disabled}
        checked={value}
        onChange={onChange}
        className={classNames(
          value ? "bg-blue-600" : "bg-gray-300",
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none"
        )}
      >
        <span className={classNames(value ? "translate-x-5" : "translate-x-1", "inline-block h-3 w-3 transform rounded-full bg-white transition-transform")} />
      </Switch>
    </div>
  );
}
