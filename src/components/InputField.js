"use client";

import React from "react";
import styles from "./InputField.module.css";

export default function InputField({
    id,
    name,
    label,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    disabled = false,
    error = "",
    helperText = "",
    showErrorText = false,
    containerClassName = "",
    inputClassName = "",
    style,
    autoComplete,
}) {
    const inputId = id || name;
    const hasError = Boolean(error);
    const describedByIds = [];

    if (showErrorText && helperText) describedByIds.push(`${inputId}-help`);
    if (showErrorText && hasError) describedByIds.push(`${inputId}-error`);

    return (
        <div className={`${styles.container} ${containerClassName}`} style={style}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`${styles.label} ${disabled ? styles.labelDisabled : ""}`}
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                name={name}
                type={type}
                className={`${styles.input} ${disabled ? styles.inputDisabled : ""} ${hasError ? styles.inputError : ""} ${inputClassName}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={describedByIds.join(" ") || undefined}
                autoComplete={autoComplete}
            />
            {showErrorText && helperText && !hasError && (
                <div id={`${inputId}-help`} className={styles.helperText}>{helperText}</div>
            )}
            {showErrorText && hasError && (
                <div id={`${inputId}-error`} className={styles.errorText}>{error}</div>
            )}
        </div>
    );
} 