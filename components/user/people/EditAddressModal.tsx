"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export type EditAddressForm = {
  streetName: string;
  streetNumber: string;
  flatApartmentNumber: string;
  floor: string;
  postalCode: string;
  city: string;
  provinceRegionState: string;
  country: string;
};

const COUNTRIES = [
  { value: "AF", label: "Afghanistan" }, { value: "AL", label: "Albania" }, { value: "DZ", label: "Algeria" },
  { value: "AR", label: "Argentina" }, { value: "AM", label: "Armenia" }, { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" }, { value: "AZ", label: "Azerbaijan" }, { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" }, { value: "BE", label: "Belgium" }, { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BR", label: "Brazil" }, { value: "BG", label: "Bulgaria" }, { value: "CA", label: "Canada" },
  { value: "CL", label: "Chile" }, { value: "CN", label: "China" }, { value: "CO", label: "Colombia" },
  { value: "HR", label: "Croatia" }, { value: "CY", label: "Cyprus" }, { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" }, { value: "EG", label: "Egypt" }, { value: "EE", label: "Estonia" },
  { value: "FI", label: "Finland" }, { value: "FR", label: "France" }, { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" }, { value: "GH", label: "Ghana" }, { value: "GR", label: "Greece" },
  { value: "HU", label: "Hungary" }, { value: "IN", label: "India" }, { value: "ID", label: "Indonesia" },
  { value: "IQ", label: "Iraq" }, { value: "IE", label: "Ireland" }, { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" }, { value: "JP", label: "Japan" }, { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" }, { value: "KE", label: "Kenya" }, { value: "KW", label: "Kuwait" },
  { value: "LV", label: "Latvia" }, { value: "LB", label: "Lebanon" }, { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" }, { value: "MY", label: "Malaysia" }, { value: "MT", label: "Malta" },
  { value: "MX", label: "Mexico" }, { value: "MA", label: "Morocco" }, { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" }, { value: "NZ", label: "New Zealand" }, { value: "NG", label: "Nigeria" },
  { value: "NO", label: "Norway" }, { value: "OM", label: "Oman" }, { value: "PK", label: "Pakistan" },
  { value: "PE", label: "Peru" }, { value: "PH", label: "Philippines" }, { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" }, { value: "QA", label: "Qatar" }, { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" }, { value: "SA", label: "Saudi Arabia" }, { value: "RS", label: "Serbia" },
  { value: "SG", label: "Singapore" }, { value: "SK", label: "Slovakia" }, { value: "SI", label: "Slovenia" },
  { value: "ZA", label: "South Africa" }, { value: "KR", label: "South Korea" }, { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" }, { value: "SE", label: "Sweden" }, { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" }, { value: "TN", label: "Tunisia" }, { value: "TR", label: "Turkey" },
  { value: "UA", label: "Ukraine" }, { value: "AE", label: "United Arab Emirates" },
  { value: "UK", label: "United Kingdom" }, { value: "US", label: "United States" },
  { value: "UZ", label: "Uzbekistan" }, { value: "VN", label: "Vietnam" },
];

const CITIES = [
  "Abu Dhabi", "Accra", "Addis Ababa", "Almaty", "Amsterdam", "Ankara", "Athens",
  "Baghdad", "Baku", "Bangkok", "Barcelona", "Beijing", "Beirut", "Belgrade",
  "Berlin", "Bogotá", "Brussels", "Bucharest", "Budapest", "Buenos Aires",
  "Cairo", "Cape Town", "Casablanca", "Chicago", "Colombo", "Copenhagen",
  "Dhaka", "Dubai", "Dublin", "Frankfurt", "Geneva", "Hamburg", "Helsinki",
  "Ho Chi Minh City", "Hong Kong", "Houston", "Istanbul", "Jakarta",
  "Johannesburg", "Karachi", "Kathmandu", "Kyiv", "Lagos", "Lahore", "Lima",
  "Lisbon", "London", "Los Angeles", "Luxembourg City", "Madrid", "Manila",
  "Melbourne", "Mexico City", "Miami", "Milan", "Minsk", "Montreal", "Moscow",
  "Mumbai", "Munich", "Muscat", "Nairobi", "New York", "Nicosia", "Oslo",
  "Paris", "Prague", "Riyadh", "Rome", "San Francisco", "Santiago", "São Paulo",
  "Seoul", "Singapore", "Sofia", "Stockholm", "Sydney", "Taipei", "Tashkent",
  "Tehran", "Tel Aviv", "Tokyo", "Toronto", "Vienna", "Warsaw", "Washington DC",
  "Zurich",
];

const PROVINCES = [
  "Abruzzo", "Alsace", "Andalusia", "Attica", "Bavaria", "Baden-Württemberg",
  "Balochistan", "British Columbia", "California", "Catalonia", "Central Java",
  "Colombo District", "Delhi", "England", "Florida", "Fujian", "Gauteng",
  "Geneva", "Gujarat", "Île-de-France", "Illinois", "Islamabad Capital Territory",
  "Istanbul", "Karnataka", "Kerala", "Khyber Pakhtunkhwa", "Limassol District",
  "Lombardy", "Lower Saxony", "Maharashtra", "Michigan", "New South Wales",
  "New York", "Nicosia District", "North Rhine-Westphalia", "Northern Ireland",
  "Ontario", "Osaka", "Provence-Alpes-Côte d'Azur", "Punjab", "Quebec",
  "Rajasthan", "Riyadh Region", "Scotland", "Sindh", "Taipei City", "Tamil Nadu",
  "Telangana", "Texas", "Tokyo Metropolis", "Uttar Pradesh", "Vaud",
  "Victoria", "Wales", "West Bengal", "Western Cape", "Zurich",
];

const defaultForm: EditAddressForm = {
  streetName: "",
  streetNumber: "",
  flatApartmentNumber: "",
  floor: "",
  postalCode: "",
  city: "",
  provinceRegionState: "",
  country: "",
};

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EditAddressForm>;
  onSave?: (values: EditAddressForm) => void;
}

/** Edit Address modal – Figma 124-5150. Backdrop #002B5775. */
export default function EditAddressModal({
  open,
  onClose,
  initialValues,
  onSave,
}: EditAddressModalProps) {
  const [form, setForm] = useState<EditAddressForm>(defaultForm);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!prevOpenRef.current && initialValues) {
        setForm({ ...defaultForm, ...initialValues });
      }
    } else {
      setForm(defaultForm);
    }
    prevOpenRef.current = open;
  }, [open, initialValues]);

  if (!open) return null;

  function update(field: keyof EditAddressForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave?.(form);
    onClose();
  }

  const inputClass =
    "w-full rounded-lg border border-[#DFDFDF] px-3 py-2 text-sm focus:border-[var(--color-dash-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dash-accent)]";
  const labelClass =
    "edit-personal-label mb-1.5 block text-base font-medium text-gray-700";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "#002B5775" }}
        aria-hidden
        onClick={onClose}
      />
      <div
        className="edit-personal-details-modal edit-modal-container fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl shadow-xl edit-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 py-4 edit-modal-header sm:px-6">
          <h2 id="edit-address-title" className="dash-card-section-title">
            Edit Address
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-11rem)] min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Street name <span className="edit-personal-asterisk">*</span>
              </label>
              <input
                type="text"
                value={form.streetName}
                onChange={(e) => update("streetName", e.target.value)}
                placeholder="Enter street name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Street number <span className="edit-personal-asterisk">*</span>
              </label>
              <input
                type="text"
                value={form.streetNumber}
                onChange={(e) => update("streetNumber", e.target.value)}
                placeholder="Enter street number"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Flat/Appartment number (if applicable)
              </label>
              <input
                type="text"
                value={form.flatApartmentNumber}
                onChange={(e) => update("flatApartmentNumber", e.target.value)}
                placeholder="Enter flat/appartment number"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Floor <span className="edit-personal-asterisk">*</span>
              </label>
              <input
                type="text"
                value={form.floor}
                onChange={(e) => update("floor", e.target.value)}
                placeholder="Enter floor"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Postal code <span className="edit-personal-asterisk">*</span>
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="Enter postal code"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Select Province/region/state
              </label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.provinceRegionState}
                  onChange={(e) => update("provinceRegionState", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select province/region/state</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Select city <span className="edit-personal-asterisk">*</span>
              </label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Country <span className="edit-personal-asterisk">*</span>
              </label>
              <div className="edit-personal-select-wrap relative">
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className={cn(inputClass, "edit-personal-dropdown-border")}
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className="edit-personal-dropdown-chevron" aria-hidden>
                  <svg viewBox="0 0 12 6" width="12" height="6" fill="none" stroke="#878787dd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 6, opacity: 1 }}>
                    <polyline points="2 0 6 6 10 0" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="edit-personal-save-btn rounded-lg px-4 py-2 text-white hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
        </div>
    </>
  );
}
