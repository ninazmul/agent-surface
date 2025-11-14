"use client";

import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ILead } from "@/lib/database/models/lead.model";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface SalesDashboardProps {
  leads: ILead[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ leads = [] }) => {
  const parseNumber = (v?: string) =>
    parseFloat((v || "0").replace(/,/g, "").trim()) || 0;

  const salesByCountry = useMemo(() => {
    const result: Record<string, number> = {};
    leads
      .filter((l) => l.paymentStatus === "Accepted")
      .forEach((lead) => {
        const c = lead.home.country?.trim() || "Unknown";
        const courseTotal = Array.isArray(lead.course)
          ? lead.course.reduce((s, c2) => s + Number(c2.courseFee || 0), 0)
          : 0;
        const servicesTotal = Array.isArray(lead.services)
          ? lead.services.reduce((s, c2) => s + parseNumber(c2.amount), 0)
          : 0;
        const discount = parseNumber(lead.discount);
        result[c] = (result[c] || 0) + courseTotal + servicesTotal - discount;
      });
    return result;
  }, [leads]);

  // Top 3 countries
  const salesCountries = Object.keys(salesByCountry).sort(
    (a, b) => (salesByCountry[b] || 0) - (salesByCountry[a] || 0)
  );
  const top3Countries = salesCountries.slice(0, 3);
  const colorMap: Record<string, string> = {};
  const colors = ["#7C3AED", "#F97316", "#3B82F6"];
  top3Countries.forEach((c, idx) => (colorMap[c] = colors[idx % colors.length]));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sales by Country</h1>
      <ComposableMap
        projectionConfig={{ scale: 160 }}
        className="shadow-md rounded-2xl overflow-hidden"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.NAME;
              const sales = salesByCountry[countryName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorMap[countryName] || "#E5E7EB"}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", opacity: 0.8, cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                  data-tooltip-id="world-map-tooltip"
                  data-tooltip-content={`${countryName}: €${sales.toLocaleString()}`}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip id="world-map-tooltip" place="top" />
    </div>
  );
};

export default SalesDashboard;
