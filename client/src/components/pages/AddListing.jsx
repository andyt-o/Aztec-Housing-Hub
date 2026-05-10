import { useState, useEffect, useRef } from "react";
import { checkProfanity, hasProfanity, censor, validateField } from "../utils/profanity";

const apiBaseUrl = "/api";

function formatDateToDisplay(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateString;
}

function parseDisplayDate(displayValue) {
  if (!displayValue) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayValue)) return displayValue;
  const parts = displayValue.split("-");
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return displayValue;
}

function CalendarWidget({ selectedDate, onChange, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function handleDayClick(day) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    onClose();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function isDisabled(day) {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  }

  return (
    <div className="calendar-popup">
      <div className="calendar-header">
        <button type="button" className="cal-nav" onClick={prevMonth}>&#9664;</button>
        <span className="cal-title">{months[viewMonth]} {viewYear}</span>
        <button type="button" className="cal-nav" onClick={nextMonth}>&#9654;</button>
      </div>
      <div className="calendar-grid">
        {weekdays.map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="cal-day empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isSelected = selectedDate === `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return (
            <button
              key={day}
              type="button"
              className={`cal-day${isSelected ? " selected" : ""}${isDisabled(day) ? " disabled" : ""}`}
              disabled={isDisabled(day)}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const initialForm = {
  title: "",
  price: "",
  zipcode: "",
  city: "",
  beds: "1",
  baths: "1",
  distance: 0,
  availability: "",
  description: "",
  type: "Apartment",
};

const ZIP_TO_DISTANCE = {
  "92101": 5, "92102": 5, "92103": 5, "92104": 6, "92105": 6,
  "92106": 6, "92107": 7, "92108": 7, "92109": 8, "92110": 8,
  "92111": 7, "92113": 6, "92114": 6, "92115": 4, "92116": 3,
  "92117": 3, "92118": 4, "92119": 5, "92120": 8, "92121": 7,
  "92122": 4, "92123": 5, "92124": 7, "92126": 8, "92127": 10,
  "92128": 12, "92129": 11, "92130": 12, "92131": 13, "92134": 10,
  "92135": 9, "92136": 8, "92137": 8, "92138": 10, "92139": 11,
  "92140": 10, "92142": 12, "92143": 13, "92145": 11, "92147": 12,
  "92149": 14, "92150": 14, "92152": 13, "92153": 12, "92154": 11,
  "92155": 10, "92160": 8, "92161": 7, "92162": 8, "92163": 7,
  "92164": 6, "92165": 5, "92166": 5, "92167": 6, "92168": 7,
  "92169": 8, "92170": 10, "92171": 11, "92172": 12, "92173": 13,
  "92174": 14, "92175": 13, "92176": 12, "92177": 11, "92178": 10,
  "92179": 9, "92182": 0, "92183": 2, "92186": 5, "92187": 6,
  "92190": 8, "92191": 7, "92192": 4, "92193": 3, "92194": 3,
  "92195": 5, "92196": 7, "92197": 8, "92198": 9, "92199": 10,
  "92020": 22, "92021": 24, "92022": 26, "92023": 25, "92024": 25,
  "92037": 15, "92054": 30, "92056": 32, "92057": 31, "92051": 26,
  "92060": 33, "92061": 34, "92062": 33, "92063": 32, "92064": 31,
  "92065": 33, "92066": 35, "92067": 30, "92068": 30, "92069": 31,
  "92070": 31, "92071": 32, "92072": 32, "92073": 33, "92074": 34,
  "92075": 33, "92076": 32, "92077": 33, "92078": 34, "92079": 35,
  "92081": 26, "92082": 27, "92083": 28, "92084": 27, "92085": 38,
  "92086": 38, "92093": 15,
  "92501": 55, "92502": 54, "92503": 55, "92504": 56, "92505": 55,
  "92506": 54, "92507": 53, "92508": 54, "92509": 55, "92510": 56,
  "92511": 55, "92512": 54, "92513": 55, "92514": 56, "92515": 55,
  "92516": 54, "92517": 55, "92518": 56, "92519": 55, "92520": 54,
  "92521": 53, "92522": 54, "92523": 55, "92524": 56, "92525": 55,
  "92526": 54, "92527": 55, "92528": 56, "92529": 55, "92530": 54,
  "92531": 55, "92532": 56, "92533": 55, "92534": 54, "92535": 55,
  "92536": 56, "92537": 55, "92538": 54, "92539": 55, "92540": 56,
  "92541": 55, "92542": 54, "92543": 55, "92544": 56, "92545": 55,
  "92546": 54, "92547": 55, "92548": 56, "92549": 55, "92550": 54,
  "92551": 55, "92552": 56, "92553": 55, "92554": 54, "92555": 55,
  "92556": 56, "92557": 55, "92558": 54, "92559": 55, "92560": 56,
  "92561": 55, "92562": 54, "92563": 55, "92564": 56, "92565": 55,
  "92566": 54, "92567": 55, "92568": 56, "92569": 55, "92570": 54,
  "92571": 55, "92572": 56, "92573": 55, "92574": 54, "92575": 55,
  "92576": 56, "92577": 55, "92578": 54, "92579": 55, "92580": 56,
  "92581": 55, "92582": 54, "92583": 55, "92584": 56, "92585": 55,
  "92586": 54, "92587": 55, "92588": 56, "92589": 55, "92590": 54,
  "92591": 55, "92592": 56, "92593": 55, "92594": 54, "92595": 55,
  "92596": 56,
};

const listingTypes = ["Apartment", "Room", "House", "Sublease"];

export default function AddListing({ currentUser, onAddListing }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zipcodes, setZipcodes] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarAnchorRef = useRef(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/zipcodes`)
      .then((r) => r.json())
      .then((data) => setZipcodes(data.zipcodes || []))
      .catch(() => {});
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    if (form.zipcode.length >= 1) {
      const matches = zipcodes.filter((z) =>
        z.zip.startsWith(form.zipcode.trim())
      );
      setCityOptions(matches.slice(0, 15));
    } else {
      const seen = new Set();
      const unique = [];
      for (const z of zipcodes) {
        if (!seen.has(z.city)) {
          seen.add(z.city);
          unique.push(z);
        }
      }
      setCityOptions(unique.slice(0, 10));
    }
  }, [form.zipcode, zipcodes]);

  useEffect(() => {
    if (form.zipcode.length === 5) {
      setForm((prev) => ({
        ...prev,
        distance: ZIP_TO_DISTANCE[form.zipcode] ?? 0,
      }));
    }
  }, [form.zipcode]);

  function handleCitySelect(city, zip) {
    const dist = ZIP_TO_DISTANCE[zip] ?? 0;
    setForm((prev) => ({
      ...prev,
      city: city,
      zipcode: zip,
      distance: dist,
    }));
    setCityOptions([]);
  }

  function handleAvailabilityClick() {
    setShowCalendar((prev) => !prev);
  }

  function handleDateSelect(isoDate) {
    updateField("availability", formatDateToDisplay(isoDate));
    setShowCalendar(false);
  }

  useEffect(() => {
    if (!showCalendar) return;
    function handleClick(e) {
      if (calendarAnchorRef.current && !calendarAnchorRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCalendar]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 8000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const errs = {};
    if (!form.title.trim()) {
      errs.title = "Title is required.";
    } else {
      const titleCheck = await checkProfanity(form.title.trim());
      if (titleCheck.isProfane) errs.title = "Title contains inappropriate language.";
    }
    if (!form.price) {
      errs.price = "Price is required.";
    } else if (Number(form.price) < 1) {
      errs.price = "Price must be at least $1.";
    }
    if (!form.availability.trim()) {
      errs.availability = "Availability is required.";
    } else {
      const avail = form.availability.trim();
      const iso = parseDisplayDate(avail);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(iso)) {
        errs.availability = "Please enter a valid date (DD-MM-YYYY).";
      } else {
        const parsed = new Date(iso);
        if (isNaN(parsed.getTime())) {
          errs.availability = "Please enter a valid date.";
        } else if (parsed < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) {
          errs.availability = "Date cannot be in the past.";
        }
      }
    }
    if (!form.type) errs.type = "Listing type is required.";
    if (!form.city && !form.zipcode) {
      errs.area = "Area (city or zipcode) is required.";
    } else {
      const zip = form.zipcode.trim();
      if (zip.length > 0 && !zipcodes.some((z) => z.zip === zip)) {
        errs.area = "Please enter a valid zipcode from the list.";
      }
    }
    if (form.description.trim()) {
      const descCheck = await checkProfanity(form.description.trim());
      if (descCheck.isProfane) errs.description = "Description contains inappropriate language.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/add-listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          price: Number(form.price),
          area: form.city || form.zipcode,
          beds: Number(form.beds),
          baths: Number(form.baths),
          distance: Number(form.distance) || 0,
          availability: parseDisplayDate(form.availability.trim()),
          description: form.description.trim(),
          type: form.type,
          placement: "offCampus",
          ownerEmail: (currentUser?.email || "").trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        setError(data.message || "Unable to post your listing.");
        return;
      }

      onAddListing(data.listing);
      setForm(initialForm);
      setSuccess("Listing posted successfully!");
    } catch (err) {
      setError("Could not reach the server. Make sure the Python backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-banner">
        <div className="page-banner-inner">
          <p className="eyebrow">Add Listing</p>
          <h2>Post Your Housing</h2>
          <p>Share your available housing with the SDSU community.</p>
        </div>
      </div>

      <main className="page-content">
        <section className="add-listing-page">
          {error && <p className="form-message error">{error}</p>}
          {success && <p className="form-message success">{success}</p>}

          <form className="add-listing-form" onSubmit={handleSubmit}>
            <label>
              Listing Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Example: Mission Valley 1BR Summer Sublease"
                maxLength={120}
                className={fieldErrors.title ? "field-error-input" : ""}
              />
              {fieldErrors.title && (
                <small className="field-error">{fieldErrors.title}</small>
              )}
            </label>

            <label>
              Listing Type
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                disabled={isSubmitting}
                className={fieldErrors.type ? "field-error-input" : ""}
              >
                {listingTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {fieldErrors.type && (
                <small className="field-error">{fieldErrors.type}</small>
              )}
            </label>

            <div className="add-listing-grid">
              <label>
                Monthly Rent ($)
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="e.g. 1200"
                  disabled={isSubmitting}
                  className={fieldErrors.price ? "field-error-input" : ""}
                />
                <small className="field-hint">
                  Will be clamped to $25-$10,000 range.
                </small>
              </label>

              <label>
                Area (Zipcode)
                <input
                  type="text"
                  value={form.zipcode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                    updateField("zipcode", v);
                    updateField("city", "");
                  }}
                  placeholder="e.g. 92182"
                  maxLength={5}
                  disabled={isSubmitting}
                  className={fieldErrors.area ? "field-error-input" : ""}
                />
                {cityOptions.length > 0 && (
                  <div className="city-dropdown">
                    {cityOptions.map((z) => (
                      <button
                        key={z.zip}
                        type="button"
                        className="city-option"
                        onClick={() => handleCitySelect(z.city, z.zip)}
                      >
                        {z.zip} — {z.city}
                      </button>
                    ))}
                  </div>
                )}
                {form.city && (
                  <small className="field-hint">Selected city: {form.city}</small>
                )}
                {fieldErrors.area && (
                  <small className="field-error">{fieldErrors.area}</small>
                )}
              </label>

              <label>
                Bedrooms
                <select
                  value={form.beds}
                  onChange={(e) => updateField("beds", e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </label>

              <label>
                Bathrooms
                <select
                  value={form.baths}
                  onChange={(e) => updateField("baths", e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </label>

              <label ref={calendarAnchorRef}>
                Availability
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    value={form.availability}
                    onClick={handleAvailabilityClick}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9\-]/g, "");
                      updateField("availability", raw);
                    }}
                    placeholder="DD-MM-YYYY or click calendar"
                    disabled={isSubmitting}
                    className={fieldErrors.availability ? "field-error-input" : ""}
                  />
                  <button
                    type="button"
                    className="calendar-toggle"
                    onClick={handleAvailabilityClick}
                    disabled={isSubmitting}
                    aria-label="Open calendar"
                  >
                    &#128197;
                  </button>
                  {showCalendar && (
                    <CalendarWidget
                      selectedDate={parseDisplayDate(form.availability)}
                      onChange={handleDateSelect}
                      onClose={() => setShowCalendar(false)}
                    />
                  )}
                </div>
                {fieldErrors.availability && (
                  <small className="field-error">
                    {fieldErrors.availability}
                  </small>
                )}
              </label>
            </div>

            <label>
              Description
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Include lease term, furniture, parking, and utilities."
                disabled={isSubmitting}
                className={fieldErrors.description ? "field-error-input" : ""}
              />
              {fieldErrors.description && (
                <small className="field-error">{fieldErrors.description}</small>
              )}
            </label>

            <div className="form-row">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : `Post ${form.type || "Listing"}`}
              </button>
              {form.price && (
                <span className="price-preview">
                  Displayed price: $
                  {Math.max(25, Math.min(10000, Number(form.price) || 0)).toLocaleString()}
                </span>
              )}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}