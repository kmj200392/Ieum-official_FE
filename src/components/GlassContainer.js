"use client";
import React from "react";
import cls from "./GlassContainer.module.css";

/**
 * GlassContainer
 * - 재사용 가능한 유리 배경 컨테이너
 * - props
 *   - as: 감쌀 엘리먼트 태그 (div/section 등)
 *   - radius: 테두리 반경(px). 기본 50
 *   - padding: 내부 패딩. 기본 0 (상위에서 제어)
 *   - variant: "container" | "modal" (배경/블러 강도)
 *   - noStroke: true면 외곽선 비활성화
 *   - className: 추가 클래스
 */
export default function GlassContainer({
    as: Tag = "div",
    radius = 50,
    padding = 0,
    variant = "container",
    noStroke = false,
    className = "",
    children,
    ...rest
}) {
    const variantClass = variant === "modal" ? cls.modalBackground : cls.containerBackground;
    const strokeClass = noStroke ? cls.noStroke : "";
    const styleVars = { "--glass-radius": `${radius}px`, "--glass-padding": typeof padding === "number" ? `${padding}px` : padding };

    return (
        <Tag className={`${cls.glassBase} ${variantClass} ${strokeClass} ${className}`} style={styleVars} {...rest}>
            {children}
        </Tag>
    );
} 