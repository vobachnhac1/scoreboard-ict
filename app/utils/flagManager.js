/**
 * Flag Manager Utility
 * Quản lý import và mapping các quốc kỳ
 */

// Import default flag
import VietnamFlag from "../assets/flags/Vietnam.png";

// Import Đông Nam Á
import ThailandFlag from "../assets/flags/Thailand.png";
import LaosFlag from "../assets/flags/Laos.png";
import CambodiaFlag from "../assets/flags/Cambodia.png";
import MyanmarFlag from "../assets/flags/Myanmar.png";
import MalaysiaFlag from "../assets/flags/Malaysia.png";
import SingaporeFlag from "../assets/flags/Singapore.png";
import IndonesiaFlag from "../assets/flags/Indonesia.png";
import PhilippinesFlag from "../assets/flags/Philippines.png";
import BruneiFlag from "../assets/flags/Brunei.png";
import EastTimorFlag from "../assets/flags/East Timor.png";

// Import Đông Á
import ChinaFlag from "../assets/flags/China.png";
import JapanFlag from "../assets/flags/Japan.png";
import SouthKoreaFlag from "../assets/flags/South Korea.png";
import NorthKoreaFlag from "../assets/flags/North Korea.png";
import HongKongFlag from "../assets/flags/Hong-Kong.png";
import MacauFlag from "../assets/flags/Macau.png";
import TaiwanFlag from "../assets/flags/China.png"; // Sử dụng China flag

// Import Nam Á
import IndiaFlag from "../assets/flags/India.png";
import PakistanFlag from "../assets/flags/Pakistan.png";
import BangladeshFlag from "../assets/flags/Bangladesh.png";
import SriLankaFlag from "../assets/flags/Sri Lanka.png";
import NepalFlag from "../assets/flags/Nepal.png";

// Import Châu Âu
import FranceFlag from "../assets/flags/France.png";
import GermanyFlag from "../assets/flags/Germany.png";
import UKFlag from "../assets/flags/England.png";
import EnglandFlag from "../assets/flags/England.png";
import ScotlandFlag from "../assets/flags/Scotland.png";
import WalesFlag from "../assets/flags/Wales.png";
import ItalyFlag from "../assets/flags/Italy.png";
import SpainFlag from "../assets/flags/Spain.png";
import PortugalFlag from "../assets/flags/Portugal.png";
import NetherlandsFlag from "../assets/flags/Netherlands.png";
import BelgiumFlag from "../assets/flags/Belgium.png";
import SwitzerlandFlag from "../assets/flags/Switzerland.png";
import AustriaFlag from "../assets/flags/Austria.png";
import PolandFlag from "../assets/flags/Poland.png";
import RussiaFlag from "../assets/flags/Russia.png";
import UkraineFlag from "../assets/flags/Ukraine.png";

// Import Châu Mỹ
import USAFlag from "../assets/flags/USA.png";
import CanadaFlag from "../assets/flags/Canada.png";
import BrazilFlag from "../assets/flags/Brazil.png";
import MexicoFlag from "../assets/flags/Mexico.png";
import ArgentinaFlag from "../assets/flags/Argentina.png";
import ChileFlag from "../assets/flags/Chile.png";

// Import Châu Đại Dương
import AustraliaFlag from "../assets/flags/Australia.png";
import NewZealandFlag from "../assets/flags/New Zealand.png";

// Import Châu Phi
import SouthAfricaFlag from "../assets/flags/South Africa.png";
import EgyptFlag from "../assets/flags/Egypt.png";
import NigeriaFlag from "../assets/flags/Nigeria.png";
import KenyaFlag from "../assets/flags/Kenya.png";

// Import Trung Đông
import SaudiArabiaFlag from "../assets/flags/Saudi Arabia.png";
import UAEFlag from "../assets/flags/user.png"; // Placeholder
import IsraelFlag from "../assets/flags/Israel.png";
import TurkeyFlag from "../assets/flags/Turkey.png";
import IranFlag from "../assets/flags/Iran.png";

/**
 * Flag mapping object
 * Key: tên quốc gia (lowercase, normalized)
 * Value: imported flag image
 */
export const FLAG_MAP = {
  // Đông Nam Á
  vietnam: VietnamFlag,
  "viet nam": VietnamFlag,
  thailand: ThailandFlag,
  laos: LaosFlag,
  cambodia: CambodiaFlag,
  myanmar: MyanmarFlag,
  burma: MyanmarFlag,
  malaysia: MalaysiaFlag,
  singapore: SingaporeFlag,
  indonesia: IndonesiaFlag,
  philippines: PhilippinesFlag,
  brunei: BruneiFlag,
  "east timor": EastTimorFlag,
  "timor-leste": EastTimorFlag,

  // Đông Á
  china: ChinaFlag,
  japan: JapanFlag,
  "south korea": SouthKoreaFlag,
  korea: SouthKoreaFlag,
  "north korea": NorthKoreaFlag,
  "hong kong": HongKongFlag,
  "hong-kong": HongKongFlag,
  macau: MacauFlag,
  taiwan: TaiwanFlag,

  // Nam Á
  india: IndiaFlag,
  pakistan: PakistanFlag,
  bangladesh: BangladeshFlag,
  "sri lanka": SriLankaFlag,
  nepal: NepalFlag,

  // Châu Âu
  france: FranceFlag,
  germany: GermanyFlag,
  "united kingdom": UKFlag,
  uk: UKFlag,
  england: EnglandFlag,
  scotland: ScotlandFlag,
  wales: WalesFlag,
  italy: ItalyFlag,
  spain: SpainFlag,
  portugal: PortugalFlag,
  netherlands: NetherlandsFlag,
  belgium: BelgiumFlag,
  switzerland: SwitzerlandFlag,
  austria: AustriaFlag,
  poland: PolandFlag,
  russia: RussiaFlag,
  ukraine: UkraineFlag,

  // Châu Mỹ
  "united states": USAFlag,
  usa: USAFlag,
  america: USAFlag,
  us: USAFlag,
  canada: CanadaFlag,
  brazil: BrazilFlag,
  mexico: MexicoFlag,
  argentina: ArgentinaFlag,
  chile: ChileFlag,

  // Châu Đại Dương
  australia: AustraliaFlag,
  "new zealand": NewZealandFlag,

  // Châu Phi
  "south africa": SouthAfricaFlag,
  egypt: EgyptFlag,
  nigeria: NigeriaFlag,
  kenya: KenyaFlag,

  // Trung Đông
  "saudi arabia": SaudiArabiaFlag,
  uae: UAEFlag,
  israel: IsraelFlag,
  turkey: TurkeyFlag,
  iran: IranFlag,
};

/**
 * Get flag image by country name
 * @param {string} country - Tên quốc gia
 * @returns {string} - Flag image path
 */
export const getFlagImage = (country) => {
  // Nếu country rỗng hoặc undefined, dùng Vietnam
  if (!country || country.trim() === "") {
    return VietnamFlag;
  }

  // Normalize country name to lowercase for lookup
  const countryKey = country.toLowerCase().trim();

  // Check if flag exists in FLAG_MAP
  if (FLAG_MAP[countryKey]) {
    return FLAG_MAP[countryKey];
  }

  // Fallback to Vietnam
  console.warn(`⚠️ Flag not found for "${country}", using Vietnam`);
  return VietnamFlag;
};

/**
 * Get default flag (Vietnam)
 * @returns {string} - Vietnam flag image path
 */
export const getDefaultFlag = () => VietnamFlag;

/**
 * Check if a country flag exists
 * @param {string} country - Tên quốc gia
 * @returns {boolean} - True if flag exists
 */
export const hasFlagForCountry = (country) => {
  if (!country || country.trim() === "") {
    return false;
  }
  const countryKey = country.toLowerCase().trim();
  return FLAG_MAP.hasOwnProperty(countryKey);
};

/**
 * Get all available countries
 * @returns {string[]} - Array of country names
 */
export const getAvailableCountries = () => {
  return Object.keys(FLAG_MAP);
};

