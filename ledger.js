(() => {
  "use strict";

  const STORAGE_VERSION = 1;
  const DEFAULT_SETTINGS = Object.freeze({
    baseCurrency: "CNY",
    commonCurrencies: ["EUR", "CHF", "HKD"],
    lastCurrency: "CNY",
    couples: [],
    settlements: {},
    settleMode: "person"
  });
  const CATEGORIES = Object.freeze(["餐饮", "交通", "住宿", "门票", "购物", "其他"]);
  const AVATAR_COLORS = Object.freeze([
    "#D96C42", "#217D91", "#5C8E62", "#8B6AA8", "#C58B32",
    "#4F72A2", "#B85F76", "#4E8F86", "#9A6B4F", "#68798E"
  ]);

  // The picker searches every field, so the complete catalog can stay out of view
  // until a traveler asks for a particular currency.
  const SEEDED_CURRENCY_CATALOG = Object.freeze([
    ["CNY", "人民币", "Chinese Yuan", "¥", "中国 大陆 人民币 rmb yuan renminbi"],
    ["HKD", "港币", "Hong Kong Dollar", "HK$", "香港 港元 hongkong"],
    ["MOP", "澳门元", "Macanese Pataca", "MOP$", "澳门 澳币 macau pataca"],
    ["TWD", "新台币", "New Taiwan Dollar", "NT$", "台湾 台币 taiwan"],
    ["EUR", "欧元", "Euro", "€", "欧盟 欧洲 eurozone europe"],
    ["CHF", "瑞士法郎", "Swiss Franc", "CHF", "瑞士 列支敦士登 switzerland liechtenstein"],
    ["USD", "美元", "US Dollar", "$", "美国 美金 united states america usa"],
    ["GBP", "英镑", "British Pound", "£", "英国 联合王国 britain uk sterling"],
    ["JPY", "日元", "Japanese Yen", "¥", "日本 japan yen"],
    ["KRW", "韩元", "South Korean Won", "₩", "韩国 korea won"],
    ["SGD", "新加坡元", "Singapore Dollar", "S$", "新加坡 singapore 新币"],
    ["MYR", "马来西亚林吉特", "Malaysian Ringgit", "RM", "马来西亚 malaysia 马币"],
    ["THB", "泰铢", "Thai Baht", "฿", "泰国 thailand baht"],
    ["IDR", "印度尼西亚盾", "Indonesian Rupiah", "Rp", "印度尼西亚 印尼 indonesia rupiah"],
    ["PHP", "菲律宾比索", "Philippine Peso", "₱", "菲律宾 philippines peso"],
    ["VND", "越南盾", "Vietnamese Dong", "₫", "越南 vietnam dong"],
    ["KHR", "柬埔寨瑞尔", "Cambodian Riel", "៛", "柬埔寨 cambodia riel"],
    ["LAK", "老挝基普", "Lao Kip", "₭", "老挝 laos kip"],
    ["MMK", "缅甸元", "Myanmar Kyat", "K", "缅甸 myanmar burma kyat"],
    ["BND", "文莱元", "Brunei Dollar", "B$", "文莱 brunei"],
    ["INR", "印度卢比", "Indian Rupee", "₹", "印度 india rupee"],
    ["PKR", "巴基斯坦卢比", "Pakistani Rupee", "₨", "巴基斯坦 pakistan rupee"],
    ["BDT", "孟加拉塔卡", "Bangladeshi Taka", "৳", "孟加拉国 bangladesh taka"],
    ["LKR", "斯里兰卡卢比", "Sri Lankan Rupee", "Rs", "斯里兰卡 sri lanka rupee"],
    ["NPR", "尼泊尔卢比", "Nepalese Rupee", "रू", "尼泊尔 nepal rupee"],
    ["MVR", "马尔代夫拉菲亚", "Maldivian Rufiyaa", "Rf", "马尔代夫 maldives rufiyaa"],
    ["AED", "阿联酋迪拉姆", "UAE Dirham", "د.إ", "阿联酋 迪拜 dubai united arab emirates"],
    ["SAR", "沙特里亚尔", "Saudi Riyal", "﷼", "沙特阿拉伯 saudi arabia riyal"],
    ["QAR", "卡塔尔里亚尔", "Qatari Riyal", "﷼", "卡塔尔 qatar riyal"],
    ["KWD", "科威特第纳尔", "Kuwaiti Dinar", "د.ك", "科威特 kuwait dinar"],
    ["BHD", "巴林第纳尔", "Bahraini Dinar", ".د.ب", "巴林 bahrain dinar"],
    ["OMR", "阿曼里亚尔", "Omani Rial", "﷼", "阿曼 oman rial"],
    ["JOD", "约旦第纳尔", "Jordanian Dinar", "د.ا", "约旦 jordan dinar"],
    ["ILS", "以色列新谢克尔", "Israeli New Shekel", "₪", "以色列 israel shekel"],
    ["TRY", "土耳其里拉", "Turkish Lira", "₺", "土耳其 türkiye turkey lira"],
    ["GEL", "格鲁吉亚拉里", "Georgian Lari", "₾", "格鲁吉亚 georgia lari"],
    ["AMD", "亚美尼亚德拉姆", "Armenian Dram", "֏", "亚美尼亚 armenia dram"],
    ["AZN", "阿塞拜疆马纳特", "Azerbaijani Manat", "₼", "阿塞拜疆 azerbaijan manat"],
    ["KZT", "哈萨克斯坦坚戈", "Kazakhstani Tenge", "₸", "哈萨克斯坦 kazakhstan tenge"],
    ["UZS", "乌兹别克斯坦苏姆", "Uzbekistani Som", "soʻm", "乌兹别克斯坦 uzbekistan som"],
    ["RUB", "俄罗斯卢布", "Russian Ruble", "₽", "俄罗斯 russian russia ruble"],
    ["UAH", "乌克兰格里夫纳", "Ukrainian Hryvnia", "₴", "乌克兰 ukraine hryvnia"],
    ["PLN", "波兰兹罗提", "Polish Zloty", "zł", "波兰 poland zloty"],
    ["CZK", "捷克克朗", "Czech Koruna", "Kč", "捷克 czechia czech koruna"],
    ["HUF", "匈牙利福林", "Hungarian Forint", "Ft", "匈牙利 hungary forint"],
    ["RON", "罗马尼亚列伊", "Romanian Leu", "lei", "罗马尼亚 romania leu"],
    ["BGN", "保加利亚列弗", "Bulgarian Lev", "лв", "保加利亚 bulgaria lev"],
    ["RSD", "塞尔维亚第纳尔", "Serbian Dinar", "дин", "塞尔维亚 serbia dinar"],
    ["SEK", "瑞典克朗", "Swedish Krona", "kr", "瑞典 sweden krona"],
    ["NOK", "挪威克朗", "Norwegian Krone", "kr", "挪威 norway krone"],
    ["DKK", "丹麦克朗", "Danish Krone", "kr", "丹麦 denmark krone"],
    ["ISK", "冰岛克朗", "Icelandic Krona", "kr", "冰岛 iceland krona"],
    ["CAD", "加拿大元", "Canadian Dollar", "C$", "加拿大 canada 加元"],
    ["AUD", "澳大利亚元", "Australian Dollar", "A$", "澳大利亚 澳洲 australia 澳元"],
    ["NZD", "新西兰元", "New Zealand Dollar", "NZ$", "新西兰 new zealand 纽币"],
    ["MXN", "墨西哥比索", "Mexican Peso", "Mex$", "墨西哥 mexico peso"],
    ["BRL", "巴西雷亚尔", "Brazilian Real", "R$", "巴西 brazil real"],
    ["ARS", "阿根廷比索", "Argentine Peso", "AR$", "阿根廷 argentina peso"],
    ["CLP", "智利比索", "Chilean Peso", "CLP$", "智利 chile peso"],
    ["COP", "哥伦比亚比索", "Colombian Peso", "COL$", "哥伦比亚 colombia peso"],
    ["PEN", "秘鲁索尔", "Peruvian Sol", "S/", "秘鲁 peru sol"],
    ["UYU", "乌拉圭比索", "Uruguayan Peso", "$U", "乌拉圭 uruguay peso"],
    ["BOB", "玻利维亚诺", "Bolivian Boliviano", "Bs", "玻利维亚 bolivia boliviano"],
    ["ZAR", "南非兰特", "South African Rand", "R", "南非 south africa rand"],
    ["EGP", "埃及镑", "Egyptian Pound", "E£", "埃及 egypt pound"],
    ["MAD", "摩洛哥迪拉姆", "Moroccan Dirham", "د.م.", "摩洛哥 morocco dirham"],
    ["KES", "肯尼亚先令", "Kenyan Shilling", "KSh", "肯尼亚 kenya shilling"],
    ["TZS", "坦桑尼亚先令", "Tanzanian Shilling", "TSh", "坦桑尼亚 tanzania shilling"],
    ["NGN", "尼日利亚奈拉", "Nigerian Naira", "₦", "尼日利亚 nigeria naira"],
    ["GHS", "加纳塞地", "Ghanaian Cedi", "₵", "加纳 ghana cedi"],
    ["ETB", "埃塞俄比亚比尔", "Ethiopian Birr", "Br", "埃塞俄比亚 ethiopia birr"],
    ["MUR", "毛里求斯卢比", "Mauritian Rupee", "₨", "毛里求斯 mauritius rupee"],
    ["FJD", "斐济元", "Fijian Dollar", "FJ$", "斐济 fiji"],
    ["XPF", "太平洋法郎", "CFP Franc", "₣", "法属波利尼西亚 新喀里多尼亚 tahiti cfp"],
    ["XCD", "东加勒比元", "East Caribbean Dollar", "EC$", "东加勒比 caribbean"],
    ["JMD", "牙买加元", "Jamaican Dollar", "J$", "牙买加 jamaica"],
    ["DOP", "多米尼加比索", "Dominican Peso", "RD$", "多米尼加 dominican peso"],
    ["CRC", "哥斯达黎加科朗", "Costa Rican Colon", "₡", "哥斯达黎加 costa rica colon"],
    ["PAB", "巴拿马巴波亚", "Panamanian Balboa", "B/.", "巴拿马 panama balboa"],
    ["MNT", "蒙古图格里克", "Mongolian Tugrik", "₮", "蒙古 mongolia tugrik"]
  ].map(([code, nameZh, nameEn, symbol, aliases]) => ({ code, nameZh, nameEn, symbol, aliases })));

  function buildCurrencyCatalog(seed) {
    const byCode = new Map(seed.map((currency) => [currency.code, currency]));
    if (typeof Intl.supportedValuesOf !== "function" || typeof Intl.DisplayNames !== "function") {
      return Object.freeze([...byCode.values()]);
    }
    try {
      const namesZh = new Intl.DisplayNames(["zh-CN"], { type: "currency" });
      const namesEn = new Intl.DisplayNames(["en"], { type: "currency" });
      Intl.supportedValuesOf("currency").forEach((code) => {
        if (byCode.has(code)) return;
        const symbolPart = new Intl.NumberFormat("en", {
          style: "currency",
          currency: code,
          currencyDisplay: "narrowSymbol"
        }).formatToParts(0).find((part) => part.type === "currency");
        byCode.set(code, {
          code,
          nameZh: namesZh.of(code) || code,
          nameEn: namesEn.of(code) || code,
          symbol: symbolPart?.value || code,
          aliases: ""
        });
      });
    } catch {
      return Object.freeze([...byCode.values()]);
    }
    return Object.freeze([...byCode.values()].sort((first, second) => first.code.localeCompare(second.code)));
  }

  const CURRENCY_CATALOG = buildCurrencyCatalog(SEEDED_CURRENCY_CATALOG);

  const CURRENCY_BY_CODE = new Map(CURRENCY_CATALOG.map((currency) => [currency.code, currency]));
  const currencySearchText = new Map(CURRENCY_CATALOG.map((currency) => [
    currency.code,
    normalizeSearch([currency.code, currency.nameZh, currency.nameEn, currency.symbol, currency.aliases].join(" "))
  ]));

  let ledgerRoot = null;
  let ledgerTripId = "";
  let ledgerAdapter = null;
  let ledgerPersistenceMode = "local";
  let ledgerData = null;
  let initialized = false;
  let activeTab = "entry";
  let editingBillId = null;
  let openDialogName = null;
  let currencyPickerMode = "common";
  let currencyQuery = "";
  let notice = "";
  let billDraft = null;
  let billCatFilter = "__all";
  let billMultiMode = false;
  let billSelectedIds = new Set();
  let summaryScope = "local";

  function isFlightHotelBill(bill) {
    if (bill.category === "住宿") return true;
    if (bill.category === "交通") {
      const n = bill.note || "";
      if (/✈️/.test(n) || /机票|航班/.test(n) || /[A-Z]{2}\s?\d{3,4}/.test(n)) return true;
    }
    return false;
  }
  let editingMemberId = null;
  let editingNoteBillId = null;
  let pendingNoteSave = null;
  let noteOpenRequest = 0;
  let mutationQueue = Promise.resolve();

  function normalizeSearch(value) {
    return String(value || "")
      .normalize("NFKD")
      .toLocaleLowerCase()
      .replace(/[\s._/-]+/g, "");
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function escapeAttribute(value = "") {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix) {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return `${prefix}-${globalThis.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function avatarInitial(name) {
    const characters = Array.from(String(name || "").trim());
    if (!characters.length) return "?";
    const firstHanIndex = characters.findIndex((character) => /\p{Script=Han}/u.test(character));
    if (firstHanIndex >= 0) {
      const firstHan = characters[firstHanIndex];
      if (["小", "阿", "老"].includes(firstHan)) {
        const nextHan = characters.slice(firstHanIndex + 1).find((character) => /\p{Script=Han}/u.test(character));
        if (nextHan) return nextHan;
      }
      return firstHan;
    }
    const latin = characters.find((character) => /[A-Za-z]/.test(character));
    return latin ? latin.toUpperCase() : characters[0].toUpperCase();
  }

  function nextAvatarColor(travelers) {
    const used = new Set(travelers.map((traveler) => traveler.color.toUpperCase()));
    return AVATAR_COLORS.find((color) => !used.has(color.toUpperCase()))
      || AVATAR_COLORS[travelers.length % AVATAR_COLORS.length];
  }

  function isValidColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ""));
  }

  function toCents(value) {
    const normalized = String(value ?? "").trim().replace(/,/g, "");
    if (!/^(?:\d+|\d*\.\d{1,2})$/.test(normalized)) return null;
    const [whole = "0", fraction = ""] = normalized.split(".");
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return Number.isSafeInteger(cents) ? cents : null;
  }

  function centsToInput(cents) {
    if (!Number.isSafeInteger(cents)) return "";
    return (cents / 100).toFixed(2);
  }

  function formatMoney(cents, currencyCode) {
    const amount = Number(cents || 0) / 100;
    const zeroDecimals = ["VND", "JPY", "KRW"].includes(currencyCode);
    try {
      return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: zeroDecimals ? 0 : 2,
        maximumFractionDigits: zeroDecimals ? 0 : 2
      }).format(amount);
    } catch {
      return `${currencyCode} ${amount.toFixed(zeroDecimals ? 0 : 2)}`;
    }
  }

  function defaultData() {
    return {
      version: STORAGE_VERSION,
      settings: deepClone(DEFAULT_SETTINGS),
      travelers: [],
      bills: [],
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeCouples(rawCouples, travelers) {
    const ids = new Set(travelers.map((t) => t.id));
    const pairs = [];
    const seen = new Set();
    if (Array.isArray(rawCouples)) {
      for (const raw of rawCouples) {
        const pair = (Array.isArray(raw) ? raw : []).map(String).filter((id) => ids.has(id) && !seen.has(id));
        if (pair.length === 2) {
          seen.add(pair[0]);
          seen.add(pair[1]);
          pairs.push(pair);
        }
      }
    }
    // 4 人且未配置时，默认按加入顺序两两配对（可在结算页修改）
    if (!pairs.length && travelers.length === 4) {
      pairs.push([travelers[0].id, travelers[1].id]);
      pairs.push([travelers[2].id, travelers[3].id]);
    }
    return pairs;
  }

  function normalizeData(raw) {
    const fallback = defaultData();
    if (!raw || typeof raw !== "object") return fallback;
    const rawTravelers = Array.isArray(raw.travelers) ? raw.travelers : [];
    const usedIds = new Set();
    const travelers = rawTravelers.flatMap((traveler, index) => {
      const name = String(traveler?.name || "").trim().slice(0, 30);
      let id = String(traveler?.id || "").trim();
      if (!name) return [];
      if (!id || usedIds.has(id)) id = makeId("person");
      usedIds.add(id);
      const color = isValidColor(traveler?.color)
        ? traveler.color.toUpperCase()
        : AVATAR_COLORS[index % AVATAR_COLORS.length];
      return [{ id, name, initial: avatarInitial(name), color }];
    });
    const travelerIds = new Set(travelers.map((traveler) => traveler.id));
    const requestedBase = String(raw.settings?.baseCurrency || DEFAULT_SETTINGS.baseCurrency).toUpperCase();
    const baseCurrency = CURRENCY_BY_CODE.has(requestedBase) ? requestedBase : DEFAULT_SETTINGS.baseCurrency;
    const commonCurrencies = [...new Set(
      (Array.isArray(raw.settings?.commonCurrencies) ? raw.settings.commonCurrencies : DEFAULT_SETTINGS.commonCurrencies)
        .map((code) => String(code).toUpperCase())
        .filter((code) => CURRENCY_BY_CODE.has(code) && code !== baseCurrency)
    )];
    const availableCurrencies = new Set([baseCurrency, ...commonCurrencies]);
    const requestedLast = String(raw.settings?.lastCurrency || baseCurrency).toUpperCase();
    const lastCurrency = availableCurrencies.has(requestedLast) ? requestedLast : baseCurrency;
    const bills = (Array.isArray(raw.bills) ? raw.bills : []).flatMap((bill) => {
      const originalAmountCents = Number(bill?.originalAmountCents);
      const baseAmountCents = Number(bill?.baseAmountCents);
      const currency = String(bill?.currency || baseCurrency).toUpperCase();
      const payerId = String(bill?.payerId || "");
      const participantIds = [...new Set(Array.isArray(bill?.participantIds) ? bill.participantIds.map(String) : [])]
        .filter((id) => travelerIds.has(id));
      if (!Number.isSafeInteger(originalAmountCents) || originalAmountCents <= 0) return [];
      if (!Number.isSafeInteger(baseAmountCents) || baseAmountCents <= 0) return [];
      if (!CURRENCY_BY_CODE.has(currency) || !travelerIds.has(payerId) || !participantIds.length) return [];
      const category = CATEGORIES.includes(bill?.category) ? bill.category : "其他";
      return [{
        id: String(bill.id || makeId("bill")),
        originalAmountCents,
        baseAmountCents,
        currency,
        category,
        note: typeof bill.note === "string" ? bill.note.trim().slice(0, 160) : "",
        orderedAt: typeof bill.orderedAt === "string" ? bill.orderedAt : "",
        payerId,
        participantIds,
        createdAt: typeof bill.createdAt === "string" ? bill.createdAt : new Date().toISOString(),
        updatedAt: typeof bill.updatedAt === "string" ? bill.updatedAt : new Date().toISOString()
      }];
    });
    return {
      version: STORAGE_VERSION,
      settings: {
        baseCurrency,
        commonCurrencies,
        lastCurrency,
        couples: normalizeCouples(raw.settings?.couples, travelers),
        settlements: (raw.settings?.settlements && typeof raw.settings.settlements === "object") ? raw.settings.settlements : {},
        settleMode: raw.settings?.settleMode === "couple" ? "couple" : "person"
      },
      travelers,
      bills,
      updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : fallback.updatedAt
    };
  }

  function createLocalStorageAdapter(tripId, options = {}) {
    const runtimeStorage = globalThis.TravelRuntimeStorage;
    if (runtimeStorage?.createAdapter) {
      return runtimeStorage.createAdapter({
        ...options,
        mode: "local",
        tripId,
        collections: ["settings", "travelers", "bills"]
      });
    }

    const storageKey = options.storageKey
      || `travel-plan:runtime:v1:${encodeURIComponent(String(tripId || "default-trip"))}`;
    let memorySnapshot = null;
    let storage = options.storage;
    if (!storage) {
      try {
        storage = globalThis.localStorage || null;
      } catch {
        storage = null;
      }
    }

    function readSnapshot() {
      if (!storage) return memorySnapshot ? deepClone(memorySnapshot) : null;
      try {
        const serialized = storage.getItem(storageKey);
        if (!serialized) return memorySnapshot ? deepClone(memorySnapshot) : null;
        const parsed = JSON.parse(serialized);
        memorySnapshot = parsed && typeof parsed === "object" ? parsed : null;
        return memorySnapshot ? deepClone(memorySnapshot) : null;
      } catch (error) {
        console.warn("TravelLedger could not read localStorage; using memory for this tab.", error);
        storage = null;
        return memorySnapshot ? deepClone(memorySnapshot) : null;
      }
    }

    function writeSnapshot(next) {
      const previous = readSnapshot() || {};
      const snapshot = {
        ...previous,
        version: STORAGE_VERSION,
        settings: deepClone(next.settings),
        travelers: deepClone(next.travelers),
        bills: deepClone(next.bills),
        updatedAt: next.updatedAt
      };
      memorySnapshot = snapshot;
      if (storage) {
        try {
          storage.setItem(storageKey, JSON.stringify(snapshot));
        } catch (error) {
          console.warn("TravelLedger could not write localStorage; using memory for this tab.", error);
          storage = null;
        }
      }
      Object.assign(next, deepClone(snapshot));
      return deepClone(snapshot);
    }

    return {
      mode: "local",
      tripId,
      storageKey,
      async load() {
        return readSnapshot();
      },
      async save(next) {
        return writeSnapshot(next);
      }
    };
  }

  function createD1Adapter(tripId, options = {}) {
    const runtimeStorage = globalThis.TravelRuntimeStorage;
    if (runtimeStorage?.createAdapter) {
      return runtimeStorage.createAdapter({
        ...options,
        mode: "d1",
        tripId,
        collections: ["settings", "travelers", "bills"]
      });
    }
    let previous = null;
    const collections = ["bills", "travelers"];
    const rawApiBase = String(options.apiBase || "/api/trip").trim();
    if (!/^\/(?!\/)/.test(rawApiBase) || rawApiBase.includes("\\") || /[?#]/.test(rawApiBase)) {
      throw new Error("D1 apiBase must be a same-origin absolute path");
    }
    const apiBase = rawApiBase.replace(/\/+$/, "") || "/";
    const endpoint = `${apiBase}/${encodeURIComponent(tripId)}?collections=bills%2Ctravelers`;
    return {
      mode: "d1",
      async load() {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) throw new Error(`API ${response.status}`);
        previous = await response.json();
        return previous;
      },
      async save(next) {
        const changes = [];
        for (const collection of collections) {
          const before = new Map((previous?.[collection] || []).map((item) => [item.id, item]));
          const after = new Map((next[collection] || []).map((item) => [item.id, item]));
          before.forEach((_, id) => { if (!after.has(id)) changes.push({ op: "delete", collection, id }); });
          after.forEach((value, id) => {
            if (JSON.stringify(before.get(id)) !== JSON.stringify(value)) changes.push({ op: "upsert", collection, id, value });
          });
        }
        const response = await fetch(endpoint, {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ changes })
        });
        if (!response.ok) throw new Error(`API ${response.status}`);
        previous = await response.json();
        // The server is authoritative and merges record-level changes atomically.
        Object.assign(next, previous);
      }
    };
  }

  async function resolveTripConfig(root, options) {
    if (options.config && typeof options.config === "object") return options.config;
    if (globalThis.TRAVEL_PLAN_CONFIG && typeof globalThis.TRAVEL_PLAN_CONFIG === "object") {
      return globalThis.TRAVEL_PLAN_CONFIG;
    }
    if (options.configUrl === false) return {};
    const configUrl = options.configUrl || root.dataset.tripConfigUrl || "trip-data.json";
    try {
      const response = await fetch(configUrl, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json();
        return payload?.config && typeof payload.config === "object" ? payload.config : payload;
      }
    } catch {
      // A missing optional config must never prevent the local-first ledger from opening.
    }
    return {};
  }

  function resolvePersistence(root, options, config) {
    const optionPersistence = options.persistence && typeof options.persistence === "object"
      ? options.persistence
      : {};
    const configPersistence = config?.persistence && typeof config.persistence === "object"
      ? config.persistence
      : {};
    const requestedMode = options.persistenceMode
      || optionPersistence.mode
      || root.dataset.ledgerPersistence
      || configPersistence.mode;
    const sharedCollections = Array.isArray(optionPersistence.sharedCollections)
      ? optionPersistence.sharedCollections
      : Array.isArray(configPersistence.sharedCollections)
        ? configPersistence.sharedCollections
        : [];
    const d1Requested = String(requestedMode || "").trim().toLowerCase() === "d1";
    const mode = d1Requested && sharedCollections.includes("ledger") ? "d1" : "local";
    const d1Options = {
      ...(configPersistence.d1 && typeof configPersistence.d1 === "object" ? configPersistence.d1 : {}),
      ...(optionPersistence.d1 && typeof optionPersistence.d1 === "object" ? optionPersistence.d1 : {}),
      ...(options.d1 && typeof options.d1 === "object" ? options.d1 : {})
    };
    if (configPersistence.apiBase) d1Options.apiBase = configPersistence.apiBase;
    if (optionPersistence.apiBase) d1Options.apiBase = optionPersistence.apiBase;
    const localOptions = {
      ...(configPersistence.local && typeof configPersistence.local === "object" ? configPersistence.local : {}),
      ...(optionPersistence.local && typeof optionPersistence.local === "object" ? optionPersistence.local : {})
    };
    if (options.storage) localOptions.storage = options.storage;
    if (options.storageKey) localOptions.storageKey = options.storageKey;
    return { mode, d1Options, localOptions };
  }

  async function resolveTripId(root, options) {
    const explicit = options.tripId || root.dataset.tripId || document.documentElement.dataset.tripId || document.body?.dataset.tripId;
    if (explicit) return String(explicit);
    if (globalThis.TRAVEL_PLAN_DATA?.metadata?.tripId) return String(globalThis.TRAVEL_PLAN_DATA.metadata.tripId);
    try {
      const dataUrl = options.travelDataUrl || root.dataset.travelDataUrl || "trip-data.json";
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (response.ok) {
        const travelData = await response.json();
        if (travelData?.metadata?.tripId) return String(travelData.metadata.tripId);
      }
    } catch {
      // A stable path-based key still keeps unrelated trips separated offline.
    }
    const pathKey = location.pathname.replace(/[^a-z0-9\u3400-\u9fff]+/gi, "-").replace(/^-|-$/g, "");
    return pathKey || "default-trip";
  }

  function travelerById(id) {
    return ledgerData.travelers.find((traveler) => traveler.id === id);
  }

  function currencyByCode(code) {
    return CURRENCY_BY_CODE.get(code) || { code, nameZh: code, nameEn: code, symbol: code };
  }

  function availableCurrencyCodes(extraCode = "") {
    return [...new Set([
      ledgerData.settings.baseCurrency,
      ...ledgerData.settings.commonCurrencies,
      extraCode
    ].filter((code) => CURRENCY_BY_CODE.has(code)))];
  }

  function billShares(bill, field = "baseAmountCents") {
    const participantIds = bill.participantIds.filter((id) => travelerById(id));
    if (!participantIds.length) return new Map();
    const total = bill[field] || 0;
    const share = Math.floor(total / participantIds.length);
    let remainder = total - share * participantIds.length;
    return new Map(participantIds.map((id) => {
      const amount = share + (remainder > 0 ? 1 : 0);
      remainder -= remainder > 0 ? 1 : 0;
      return [id, amount];
    }));
  }

  function coupleOf(id) {
    for (const pair of ledgerData.settings.couples) {
      if (pair.includes(id)) return pair;
    }
    return null;
  }

  function couplePairs() {
    return ledgerData.settings.couples
      .map((pair) => pair.filter((id) => travelerById(id)))
      .filter((pair) => pair.length === 2);
  }

  function coupleLabel(pair) {
    return pair.map((id) => (travelerById(id) || { name: id }).name).join("&");
  }

  function isPersonalBill(bill) {
    return (bill.participantIds || []).length === 1 && bill.participantIds[0] === bill.payerId;
  }

  function coupleBreakdown(bills, pair) {
    const paid = bills.filter((b) => pair.includes(b.payerId)).reduce((s, b) => s + b.baseAmountCents, 0);
    const owed = bills.reduce((s, b) => {
      const shares = billShares(b);
      let part = 0;
      for (const id of pair) part += shares.get(id) || 0;
      return s + part;
    }, 0);
    return { paid, owed, net: paid - owed };
  }

  function coupleNetFor(bills, pair) {
    return coupleBreakdown(bills, pair).net;
  }

  function personBreakdown(dayBills, traveler) {
    const paid = dayBills.filter((b) => b.payerId === traveler.id).reduce((s, b) => s + b.baseAmountCents, 0);
    const owed = dayBills.reduce((s, b) => s + (billShares(b).get(traveler.id) || 0), 0);
    return { paid, owed, net: paid - owed };
  }

  function personNetFor(dayBills, traveler) {
    return personBreakdown(dayBills, traveler).net;
  }

  function settleTransfersFor(netById) {
    const debts = [];
    const credits = [];
    for (const [id, net] of netById) {
      if (net < -1) debts.push({ id, amount: -net });
      else if (net > 1) credits.push({ id, amount: net });
    }
    debts.sort((a, b) => b.amount - a.amount);
    credits.sort((a, b) => b.amount - a.amount);
    const out = [];
    let i = 0;
    let j = 0;
    while (i < debts.length && j < credits.length) {
      const pay = Math.min(debts[i].amount, credits[j].amount);
      out.push({ fromId: debts[i].id, toId: credits[j].id, amountCents: pay });
      debts[i].amount -= pay;
      credits[j].amount -= pay;
      if (debts[i].amount <= 1) i += 1;
      if (credits[j].amount <= 1) j += 1;
    }
    return out;
  }

  function vndOf(cents) {
    const rate = parseFloat(localStorage.getItem("vn-fx-rate") || "0.00026");
    if (!rate || rate <= 0) return null;
    return Math.round(cents / 100 / rate);
  }

  function moneyWithVnd(cents, baseCurrency) {
    const vnd = vndOf(cents);
    return vnd !== null && vnd > 0
      ? `${formatMoney(cents, baseCurrency)} <small class="ledger-day-vnd-inline">≈ ${formatMoney(vnd * 100, "VND")}</small>`
      : formatMoney(cents, baseCurrency);
  }

  function calculateStats() {
    const members = ledgerData.travelers.map((traveler) => ({
      traveler,
      paidCents: 0,
      owedCents: 0,
      netCents: 0,
      billIds: []
    }));
    const byId = new Map(members.map((entry) => [entry.traveler.id, entry]));
    ledgerData.bills.forEach((bill) => {
      const payer = byId.get(bill.payerId);
      if (payer) {
        payer.paidCents += bill.baseAmountCents;
        payer.billIds.push(bill.id);
      }
      billShares(bill).forEach((amount, participantId) => {
        const member = byId.get(participantId);
        if (!member) return;
        member.owedCents += amount;
        if (!member.billIds.includes(bill.id)) member.billIds.push(bill.id);
      });
    });
    members.forEach((member) => {
      member.netCents = member.paidCents - member.owedCents;
    });

    const debtors = members
      .filter((member) => member.netCents < 0)
      .map((member) => ({ id: member.traveler.id, amount: -member.netCents }))
      .sort((first, second) => second.amount - first.amount || first.id.localeCompare(second.id));
    const creditors = members
      .filter((member) => member.netCents > 0)
      .map((member) => ({ id: member.traveler.id, amount: member.netCents }))
      .sort((first, second) => second.amount - first.amount || first.id.localeCompare(second.id));
    const transferMemo = new Map();
    const settle = (debtAmounts, creditAmounts) => {
      const firstDebtor = debtAmounts.findIndex((amount) => amount > 0);
      if (firstDebtor < 0) return [];
      const memoKey = `${debtAmounts.join(",")}|${creditAmounts.join(",")}`;
      if (transferMemo.has(memoKey)) return transferMemo.get(memoKey);
      const lowerBound = Math.max(
        debtAmounts.filter((amount) => amount > 0).length,
        creditAmounts.filter((amount) => amount > 0).length
      );
      let best = null;
      const triedCreditAmounts = new Set();
      for (let creditIndex = 0; creditIndex < creditAmounts.length; creditIndex += 1) {
        const creditAmount = creditAmounts[creditIndex];
        if (creditAmount <= 0 || triedCreditAmounts.has(creditAmount)) continue;
        triedCreditAmounts.add(creditAmount);
        const amountCents = Math.min(debtAmounts[firstDebtor], creditAmount);
        const nextDebts = debtAmounts.slice();
        const nextCredits = creditAmounts.slice();
        nextDebts[firstDebtor] -= amountCents;
        nextCredits[creditIndex] -= amountCents;
        const remainder = settle(nextDebts, nextCredits);
        const candidate = [{ debtorIndex: firstDebtor, creditorIndex: creditIndex, amountCents }, ...remainder];
        if (!best || candidate.length < best.length) best = candidate;
        if (best.length === lowerBound) break;
      }
      const result = best || [];
      transferMemo.set(memoKey, result);
      return result;
    };
    const transfers = settle(
      debtors.map((debtor) => debtor.amount),
      creditors.map((creditor) => creditor.amount)
    ).map((transfer) => ({
      fromId: debtors[transfer.debtorIndex].id,
      toId: creditors[transfer.creditorIndex].id,
      amountCents: transfer.amountCents
    }));
    return {
      totalCents: ledgerData.bills.reduce((sum, bill) => sum + bill.baseAmountCents, 0),
      members,
      transfers
    };
  }

  function renderAvatar(traveler, size = "normal") {
    if (!traveler) return "";
    return `<span class="ledger-avatar ledger-avatar-${escapeAttribute(size)}" style="--ledger-avatar-color:${escapeAttribute(traveler.color)}" aria-hidden="true">${escapeHtml(traveler.initial)}</span>`;
  }

  function renderPersonChoice(traveler, type, name, selected) {
    return `
      <label class="ledger-person-choice">
        <input class="ledger-person-input" type="${type}" name="${escapeAttribute(name)}" value="${escapeAttribute(traveler.id)}" ${selected ? "checked" : ""}>
        <span class="ledger-person-visual">
          ${renderAvatar(traveler)}
          <span class="ledger-person-check" aria-hidden="true">✓</span>
        </span>
        <span class="ledger-person-name">${escapeHtml(traveler.name)}</span>
      </label>`;
  }

  function renderCurrencyOptions(selectedCode) {
    return availableCurrencyCodes(selectedCode).map((code) => {
      const currency = currencyByCode(code);
      return `<button class="ledger-currency-option" type="button" data-ledger-action="choose-bill-currency" data-ledger-code="${escapeAttribute(code)}" ${code === selectedCode ? "aria-current=\"true\"" : ""}><b>${escapeHtml(code)}</b><span>${escapeHtml(currency.nameZh)}</span></button>`;
    }).join("");
  }

  const QUICK_TEMPLATES = [
    { id: "meal", label: "🍜 聚餐AA", category: "餐饮", mode: "all" },
    { id: "ride", label: "🚕 打车AA", category: "交通", mode: "all" },
    { id: "hotel", label: "🏨 住宿AA", category: "住宿", mode: "all" },
    { id: "ticket", label: "🎫 门票AA", category: "门票", mode: "all" },
    { id: "flight", label: "✈️ 机票单人", category: "交通", mode: "single" },
    { id: "shop", label: "🛍 购物单人", category: "购物", mode: "single" },
    { id: "other", label: "📦 其他AA", category: "其他", mode: "all" }
  ];

  function renderQuickTemplates() {
    return `
      <div class="ledger-quick-tpls" aria-label="快捷模板：点一下填好分类和分摊人，只填金额即可">
        <span class="ledger-quick-tpls-label">快捷</span>
        ${QUICK_TEMPLATES.map((t) => `
          <button type="button" class="ledger-quick-tpl" data-ledger-action="apply-template" data-ledger-template="${escapeAttribute(t.id)}">${escapeHtml(t.label)}</button>`).join("")}
        <button type="button" class="ledger-quick-tpl ledger-quick-tpl-parse" data-ledger-action="open-parse">📋 粘贴解析</button>
      </div>`;
  }

  // ===== 粘贴解析 =====
  const PARSE_CN_NUM = { "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12 };
  let parseDrafts = [];

  function parsePad(n) { return String(n).padStart(2, "0"); }

  function vndRate() {
    const v = parseFloat((typeof window !== "undefined" ? window.localStorage?.getItem("vn-fx-rate") : null) || "0.00026");
    return v > 0 ? v : 0.00026;
  }

  function autoConvertBaseAmount(form) {
    const codeField = form?.querySelector('[data-ledger-field="currency"]');
    const originalField = form?.querySelector('[data-ledger-field="original-amount"]');
    const baseField = form?.querySelector('[data-ledger-field="base-amount"]');
    if (!codeField || !originalField || !baseField) return;
    if ((codeField.value || "").toUpperCase() !== "VND") return;
    const vnd = parseFloat((originalField.value || "").replace(/[，,]/g, ""));
    if (!(vnd > 0)) return;
    const yuan = vnd * vndRate();
    baseField.value = String(Math.round(yuan * 100) / 100);
    const help = form.querySelector(".ledger-converted-field .ledger-field-help");
    if (help) help.textContent = `按 1盾=¥${vndRate()} 自动换算，可手动改`;
  }

  function parseDateInfo(s) {
    const m1 = s.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[号日]/);
    if (m1) return { y: new Date().getFullYear(), m: +m1[1], d: +m1[2] };
    if (/今天/.test(s)) { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }; }
    if (/明天/.test(s)) { const t = new Date(); t.setDate(t.getDate() + 1); return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }; }
    const m2 = s.match(/(\d{1,2})\s*[号日]/);
    if (m2) {
      const day = +m2[1];
      return { y: 2026, m: 10, d: day };
    }
    return null;
  }

  function parseTimes(s) {
    const hits = [];
    let m;
    const re = /(\d{1,2})\s*[:：点]\s*(\d{1,2})/g;
    while ((m = re.exec(s))) hits.push({ i: m.index, t: parsePad(+m[1]) + ":" + parsePad(+m[2]) });
    const re2 = /(凌晨|清晨|早上|上午|中午|下午|傍晚|晚上|深夜)([一二两三四五六七八九十]{1,2})\s*点/g;
    while ((m = re2.exec(s))) {
      const base = { "凌晨": 0, "清晨": 6, "早上": 8, "上午": 10, "中午": 12, "下午": 12, "傍晚": 17, "晚上": 12, "深夜": 23 }[m[1]];
      let n = PARSE_CN_NUM[m[2]] ?? +m[2];
      if (m[1] === "凌晨" && n === 12) n = 0;
      let h = base + n;
      if (h >= 24) h -= 24;
      hits.push({ i: m.index, t: parsePad(h) + ":00" });
    }
    const re3 = /(凌晨|清晨|早上|上午|中午|下午|傍晚|晚上|深夜)/g;
    while ((m = re3.exec(s))) {
      const t = { "凌晨": "03:00", "清晨": "06:00", "早上": "08:00", "上午": "10:00", "中午": "12:00", "下午": "15:00", "傍晚": "18:00", "晚上": "19:00", "深夜": "22:00" }[m[1]];
      if (!hits.some((h) => Math.abs(h.i - m.index) < 3)) hits.push({ i: m.index, t });
    }
    hits.sort((a, b) => a.i - b.i);
    return hits.map((h) => h.t);
  }

  function parseAmount(s) {
    let m = s.match(/(\d+(?:\.\d+)?)\s*万\s*盾/) || s.match(/(\d+(?:\.\d+)?)\s*万\s*[Vv][Nn][Dd]/);
    if (m) {
      const vnd = Math.round(+m[1] * 10000);
      return { text: m[0], original: vnd, currency: "VND", baseCents: Math.round(vnd * vndRate() * 100) };
    }
    m = s.match(/(\d+(?:\.\d+)?)\s*盾/) || s.match(/(\d+(?:\.\d+)?)\s*[Vv][Nn][Dd]/);
    if (m) {
      const vnd = Math.round(+m[1]);
      return { text: m[0], original: vnd, currency: "VND", baseCents: Math.round(vnd * vndRate() * 100) };
    }
    m = s.match(/(\d+(?:\.\d{1,2})?)\s*万\s*(?:元|块|rmb|RMB)/);
    if (m) return { text: m[0], original: Math.round(+m[1] * 10000), currency: "CNY", baseCents: Math.round(+m[1] * 10000 * 100) };
    m = s.match(/(\d+(?:\.\d{1,2})?)\s*(?:元|块|rmb|RMB)/);
    if (m) return { text: m[0], original: Math.round(+m[1] * 100) / 100, currency: "CNY", baseCents: Math.round(+m[1] * 100) };
    m = s.match(/[¥￥]\s*(\d+(?:\.\d{1,2})?)/);
    if (m) return { text: m[0], original: +m[1], currency: "CNY", baseCents: Math.round(+m[1] * 100) };
    return null;
  }

  function parseLedgerLine(line, travelers) {
    const s = line.trim();
    if (!s) return null;
    if (/^(机票|酒店|航班|住宿|花销|消费|备注|注|行程|行程信息)[：:、]?\s*$/.test(s)) return null;
    if (/^(以上为|下面是|如下)/.test(s)) return null;

    const dInfo = parseDateInfo(s);
    const times = parseTimes(s);
    const flightNo = (s.match(/[A-Z]{2}\s?\d{3,4}/) || [""])[0];
    const airline = ((s.match(/[（(]([\u4e00-\u9fa5A-Za-z ]+?(?:航空|航|Air))[)）]/) || [])[1] || "").trim();
    const route = s.match(/([\u4e00-\u9fa5A-Za-z]+?)\s*飞\s*([\u4e00-\u9fa5A-Za-z]+?)(?=[，,。；;\s]|$)/) || [null, "", ""];
    const hotelMatch = s.match(/(?:入住|住)\s*([\u4e00-\u9fa5A-Za-z&· ]+)\s*(酒店|度假村|民宿|宾馆|旅店)/);
    let hotelName = "";
    if (hotelMatch) {
      hotelName = hotelMatch[1].replace(/^(胡志明|西贡|富国岛|河内|岘港|芽庄|大叻|美奈|会安|下龙湾)/, "").trim() + hotelMatch[2];
    }

    let category = "其他";
    let note = "";
    let isFlight = false;
    let isHotel = false;
    if (flightNo && (route[1] || /飞|航班|机票|抵达|起飞/.test(s))) {
      category = "交通";
      isFlight = true;
      const dep = times[0] || "";
      const arr = times[1] || "";
      note = `✈️ ${flightNo}${airline ? " " + airline : ""} ${route[1] || "?"}→${route[2] || "?"}${dep ? " " + dep : ""}${arr ? "-" + arr : ""}`.replace(/\s+/g, " ").trim();
    } else if (hotelMatch) {
      category = "住宿";
      isHotel = true;
      const days = [...s.matchAll(/(\d{1,2})\s*[号日]/g)].map((m) => +m[1]);
      const nights = days.length || 1;
      note = `🏨 ${hotelName}（${nights}晚）`;
    } else if (/打车|Grab|grab|出租|网约|的士|摩托|地铁|公交|轮渡|船票|缆车/.test(s) && !/门票/.test(s)) {
      category = "交通";
      note = s.slice(0, 60);
    } else if (/门票|乐园|博物馆|演出|秀|动物园|水族馆/.test(s)) {
      category = "门票";
      note = s.slice(0, 60);
    } else if (/吃|餐|咖啡|奶茶|烧烤|火锅|夜宵|小吃|喝|饭/.test(s)) {
      category = "餐饮";
      note = s.slice(0, 60);
    } else if (/买|购物|超市|免税|特产|纪念品|衣服|鞋|包/.test(s)) {
      category = "购物";
      note = s.slice(0, 60);
    } else {
      category = "其他";
      note = s.slice(0, 60);
    }
    const amt = parseAmount(s);
    if (amt) note = s.replace(amt.text || "", "").replace(/[，,。\s]+$/g, "").slice(0, 60) || note;

    const nMatch = s.match(/([0-9一二两三四五六七八九十]{1,2})\s*人/);
    let nPeople = nMatch ? (PARSE_CN_NUM[nMatch[1]] ?? +nMatch[1]) : null;
    if (/请客|我付|我请/.test(s)) nPeople = 1;
    if (!nPeople && /平摊|AA|均摊|大家/.test(s)) nPeople = travelers.length;

    let participantIds;
    if (isFlight) participantIds = travelers.length ? [travelers[0].id] : [];
    else participantIds = travelers.slice(0, nPeople ? Math.min(nPeople, travelers.length) : travelers.length).map((t) => t.id);

    const make = (dateStr, noteStr, amountStr, hour) => ({
      category,
      note: noteStr,
      orderedAt: dateStr + "T" + hour,
      currency: amt ? amt.currency : "CNY",
      amountText: amountStr,
      payerId: travelers.length ? travelers[0].id : "",
      participantIds: [...participantIds],
      text: s
    });

    // 日期字符串
    let dateBase = "";
    if (dInfo) dateBase = `${dInfo.y}-${parsePad(dInfo.m)}`;
    else dateBase = "2026-10";

    // 酒店：连住多晚按晚拆开，每晚一笔
    if (isHotel && dInfo) {
      const days = [...s.matchAll(/(\d{1,2})\s*[号日]/g)].map((m) => +m[1]);
      if (days.length > 1) {
        const per = amt ? Math.round((amt.original / days.length) * 100) / 100 : null;
        return days.map((d, idx) => make(
          `${dateBase}-${parsePad(d)}`,
          `🏨 ${hotelName}（第${idx + 1}晚/共${days.length}晚）`,
          per ? String(per) : "",
          "15:00"
        ));
      }
    }

    // 普通单笔
    let dateStr = "";
    let hour = "12:00";
    if (dInfo) {
      dateStr = `${dateBase}-${parsePad(dInfo.d)}`;
      hour = isFlight ? (times[0] || "00:00") : isHotel ? "15:00" : (times[0] || "12:00");
    } else {
      const now = new Date();
      dateStr = `${dateBase}-${parsePad(now.getDate())}`;
      hour = `${parsePad(now.getHours())}:${parsePad(now.getMinutes())}`;
    }
    return make(dateStr, note, amt ? String(amt.original) : "", hour);
  }

  function applySelfSplit(drafts, fullText, travelers) {
    const n = travelers.length;
    const SELF_SPLIT = /各自|各买各|各付各|各订|各人|分开买|分开订|各自付|各买|各付/;
    const SELF_ONLY = /自己买|自己订|自己付|我自己买|我买的|给自己买/;
    const out = [];
    for (const dr of drafts) {
      const text = dr.text || "";
      if (SELF_SPLIT.test(text)) {
        if (n < 2) {
          out.push(dr);
          continue;
        }
        const perMatch = text.match(/每人\s*(\d+(?:\.\d{1,2})?)\s*(?:元|块|¥|￥|rmb|RMB)/i);
        for (let i = 0; i < n; i++) {
          const per = perMatch ? +perMatch[1] : (dr.amountText ? Math.round((+dr.amountText / n) * 100) / 100 : null);
          out.push({
            ...dr,
            note: `${dr.note} · ${travelers[i].name}自己付`,
            payerId: travelers[i].id,
            participantIds: [travelers[i].id],
            amountText: per !== null ? String(per) : ""
          });
        }
      } else if (SELF_ONLY.test(text)) {
        out.push({
          ...dr,
          payerId: travelers[0]?.id || dr.payerId,
          participantIds: [travelers[0]?.id || dr.payerId]
        });
      } else {
        out.push(dr);
      }
    }
    return out;
  }

  function billSignature(b) {
    return [
      b.category || "",
      b.currency || "",
      b.originalAmountCents ?? "",
      (b.orderedAt || "").slice(0, 16),
      (b.note || "").trim(),
      b.payerId || "",
      [...(b.participantIds || [])].sort().join(",")
    ].join("|");
  }

  function renderParseRows() {
    const box = ledgerRoot.querySelector("[data-parse-results]");
    const footer = ledgerRoot.querySelector("[data-parse-footer]");
    if (!box) return;
    const catMark = { "餐饮": "🍜", "交通": "🚕", "住宿": "🏨", "门票": "🎫", "购物": "🛍️", "其他": "📦" };
    box.innerHTML = parseDrafts.map((dr, idx) => {
      const payerOpts = ledgerData.travelers.map((t) => `<option value="${escapeAttribute(t.id)}"${t.id === dr.payerId ? " selected" : ""}>${escapeHtml(t.name)}</option>`).join("");
      const partChips = ledgerData.travelers.map((t) => `<label class="ledger-chip"><input type="checkbox" data-parse-part="${escapeAttribute(t.id)}"${dr.participantIds.includes(t.id) ? " checked" : ""}>${escapeHtml(t.name)}</label>`).join("");
      const curLabel = dr.currency === "VND" ? "盾" : "¥";
      return `
      <div class="ledger-parse-row" data-parse-idx="${idx}">
        <div class="ledger-parse-row-head">
          <span>${catMark[dr.category] || ""} ${escapeHtml(dr.category)}</span>
          <button type="button" class="ledger-text-button" data-ledger-action="parse-remove" data-parse-idx="${idx}">删除</button>
        </div>
        <label class="ledger-parse-field"><span>备注</span><input type="text" data-parse-field="note" value="${escapeAttribute(dr.note)}"></label>
        <div class="ledger-parse-grid">
          <label class="ledger-parse-field"><span>日期</span><input type="datetime-local" data-parse-field="orderedAt" value="${escapeAttribute(dr.orderedAt)}"></label>
          <label class="ledger-parse-field"><span>金额(${curLabel})</span><input type="number" inputmode="decimal" min="0" step="0.01" data-parse-field="amount" placeholder="待填" value="${escapeAttribute(dr.amountText)}"></label>
        </div>
        <label class="ledger-parse-field"><span>买单人</span><select data-parse-field="payer">${payerOpts}</select></label>
        <div class="ledger-parse-parts"><span class="ledger-parse-parts-label">分摊</span><div class="ledger-chip-row">${partChips}</div></div>
      </div>`;
    }).join("");
    if (footer) footer.hidden = !parseDrafts.length;
  }

  function renderParseDialog() {
    return `
      <dialog class="ledger-dialog ledger-parse-dialog" data-ledger-dialog="parse">
        <div class="ledger-dialog-header">
          <div><p class="ledger-section-kicker">快捷录入</p><h3>📋 粘贴解析</h3></div>
          <button class="ledger-text-button" type="button" data-ledger-action="close-parse">关闭</button>
        </div>
        <p class="ledger-parse-hint">把机票/酒店/花销文字整段粘进来，点「解析」自动拆成账单草稿。酒店连住多晚自动按晚拆开；文本带「各自买/各付」会按人头每人记一笔。金额识别不到的先留空，补上后「全部入账」。</p>
        <textarea class="ledger-parse-input" data-parse-input rows="7" placeholder="例：&#10;3号中午在Phở Hòa餐厅吃饭，4人平摊500元&#10;2号凌晨三点：VU8601航班（越旅行航空），深圳飞胡志明，04:50抵达&#10;2号3号晚入住胡志明AMAROU酒店"></textarea>
        <div class="ledger-parse-actions">
          <button class="ledger-primary-button" type="button" data-ledger-action="parse-run">🔍 解析</button>
        </div>
        <div class="ledger-parse-results" data-parse-results></div>
        <div class="ledger-parse-footer" data-parse-footer hidden>
          <button class="ledger-primary-button" type="button" data-ledger-action="parse-book-all">✅ 全部入账</button>
        </div>
      </dialog>`;
  }

  function renderCouplesDialog() {
    const travelers = ledgerData.travelers;
    const couples = ledgerData.settings.couples;
    const partnerOf = (id) => {
      const pair = couples.find((p) => p.includes(id));
      return pair ? pair.find((x) => x !== id) : "";
    };
    const rows = travelers.map((t) => {
      const options = [`<option value="">不结对</option>`]
        .concat(travelers.filter((o) => o.id !== t.id).map((o) => `<option value="${escapeAttribute(o.id)}"${partnerOf(t.id) === o.id ? " selected" : ""}>${escapeHtml(o.name)}</option>`))
        .join("");
      return `
        <div class="ledger-couple-row">
          ${renderAvatar(t, "small")}
          <span class="ledger-couple-name">${escapeHtml(t.name)}</span>
          <select name="partner-${escapeAttribute(t.id)}" data-ledger-couple-for="${escapeAttribute(t.id)}">${options}</select>
        </div>`;
    }).join("");
    return `
      <dialog class="ledger-dialog ledger-couples-dialog" data-ledger-dialog="couples">
        <div class="ledger-dialog-header">
          <div><p class="ledger-section-kicker">结算设置</p><h3>👫 谁和谁是一对</h3></div>
          <button class="ledger-text-button" type="button" data-ledger-action="close-dialog">关闭</button>
        </div>
        <form data-ledger-form="couples" class="ledger-couples-form">
          <p class="ledger-parse-hint">互相选对方即结成一对。结算时情侣内部不分开算，两对之间只由代表转一笔。</p>
          ${rows}
          <button class="ledger-primary-button" type="submit">保存配对</button>
        </form>
      </dialog>`;
  }

  function runParse() {
    const input = ledgerRoot.querySelector("[data-parse-input]");
    const raw = input?.value || "";
    const drafts = [];
    for (const l of raw.split(/\n/)) {
      const parsed = parseLedgerLine(l, ledgerData.travelers);
      if (!parsed) continue;
      if (Array.isArray(parsed)) drafts.push(...parsed);
      else drafts.push(parsed);
    }
    parseDrafts = applySelfSplit(drafts, raw, ledgerData.travelers);
    renderParseRows();
    if (!parseDrafts.length) setNotice("没识别出可记账的内容，检查粘贴的文字格式。");
    else setNotice(`解析出 ${parseDrafts.length} 笔草稿：补上金额，点「全部入账」。`);
  }

  function renderBillForm() {
    const editingBill = ledgerData.bills.find((bill) => bill.id === editingBillId) || null;
    const draft = editingBill ? null : billDraft;
    const currency = editingBill?.currency || draft?.currency || ledgerData.settings.lastCurrency;
    const baseCurrency = ledgerData.settings.baseCurrency;
    const isForeign = currency !== baseCurrency;
    const selectedParticipants = new Set(
      editingBill?.participantIds
      || draft?.participantIds
      || ledgerData.travelers.map((traveler) => traveler.id)
    );
    const selectedPayerId = editingBill?.payerId || draft?.payerId || "";
    const selectedCategory = editingBill?.category || draft?.category || "餐饮";
    return `
      <section class="ledger-entry-card" aria-labelledby="ledger-bill-form-title">
        <div class="ledger-section-heading">
          <div>
            <p class="ledger-section-kicker">${editingBill ? "编辑账单" : "记一笔"}</p>
            <h2 id="ledger-bill-form-title">${editingBill ? "修改这笔账" : "记录本次花费"}</h2>
          </div>
          ${editingBill ? `<button class="ledger-text-button" type="button" data-ledger-action="cancel-edit">取消编辑</button>` : ""}
        </div>
        ${ledgerData.travelers.length ? `
          <form class="ledger-bill-form" data-ledger-form="bill" novalidate>
            ${editingBill ? "" : renderQuickTemplates()}
            <div class="ledger-amount-block">
              <label class="ledger-field ledger-field-currency">
                <span class="ledger-field-label">币种</span>
                <input type="hidden" name="currency" data-ledger-field="currency" value="${escapeAttribute(currency)}">
                <details class="ledger-currency-dropdown">
                  <summary><span data-ledger-currency-display>${escapeHtml(currency)} · ${escapeHtml(currencyByCode(currency).nameZh)}</span><span aria-hidden="true">⌄</span></summary>
                  <div class="ledger-currency-menu">${renderCurrencyOptions(currency)}</div>
                </details>
              </label>
              <label class="ledger-field ledger-field-amount">
                <span class="ledger-field-label">金额</span>
                <input class="ledger-amount-input" name="originalAmount" data-ledger-field="original-amount" type="text" inputmode="decimal" autocomplete="off" placeholder="0.00" value="${escapeAttribute(editingBill ? centsToInput(editingBill.originalAmountCents) : draft?.originalAmount || "")}" required>
              </label>
            </div>
            <label class="ledger-field ledger-converted-field" data-ledger-converted-field ${isForeign ? "" : "hidden"}>
              <span class="ledger-field-label">折合${escapeHtml(currencyByCode(baseCurrency).nameZh)}</span>
              <span class="ledger-converted-input-wrap">
                <span class="ledger-converted-code">${escapeHtml(baseCurrency)}</span>
                <input class="ledger-input" name="baseAmount" data-ledger-field="base-amount" type="text" inputmode="decimal" autocomplete="off" placeholder="自动换算，可手动改" value="${escapeAttribute(editingBill && isForeign ? centsToInput(editingBill.baseAmountCents) : draft?.baseAmount || "")}" ${isForeign ? "required" : ""}>
              </span>
              <small class="ledger-field-help">选越南盾时按 1盾=¥${escapeHtml(String(vndRate()))} 自动换算，可手动改</small>
            </label>

            <fieldset class="ledger-fieldset">
              <legend class="ledger-field-label">分类</legend>
              <div class="ledger-category-grid">
                ${CATEGORIES.map((category) => `
                  <label class="ledger-category-choice">
                    <input class="ledger-category-input" type="radio" name="category" value="${escapeAttribute(category)}" ${category === selectedCategory ? "checked" : ""}>
                    <span>${escapeHtml(category)}</span>
                  </label>`).join("")}
              </div>
            </fieldset>

            <label class="ledger-field ledger-note-field">
              <span class="ledger-field-label">备注 <small>选填</small></span>
              <input class="ledger-input" type="text" name="note" maxlength="160" autocomplete="off" placeholder="例如：米兰大教堂门票" value="${escapeAttribute(editingBill?.note || draft?.note || "")}">
            </label>

            <label class="ledger-field ledger-date-field">
              <span class="ledger-field-label">下单时间 <small>选填</small></span>
              <input class="ledger-input" type="datetime-local" name="orderedAt" value="${escapeAttribute(editingBill?.orderedAt || draft?.orderedAt || "")}">
            </label>

            <fieldset class="ledger-fieldset">
              <legend class="ledger-field-label">买单人 <small>单选</small></legend>
              <div class="ledger-person-grid">
                ${ledgerData.travelers.map((traveler) => renderPersonChoice(traveler, "radio", "payerId", selectedPayerId === traveler.id)).join("")}
              </div>
            </fieldset>

            <fieldset class="ledger-fieldset">
              <div class="ledger-fieldset-heading">
                <legend class="ledger-field-label">参与分账人 <small>多选</small></legend>
                <button class="ledger-text-button" type="button" data-ledger-action="select-all-participants">全选</button>
              </div>
              <div class="ledger-person-grid">
                ${ledgerData.travelers.map((traveler) => renderPersonChoice(traveler, "checkbox", "participantIds", selectedParticipants.has(traveler.id))).join("")}
              </div>
              <p class="ledger-split-summary" data-ledger-split-summary></p>
            </fieldset>

            <p class="ledger-form-error" data-ledger-form-error role="alert"></p>
            <button class="ledger-primary-button" type="submit">${editingBill ? "保存修改" : "保存账单"}</button>
          </form>` : `
          <div class="ledger-onboarding">
            <p>先添加本次同行人，再开始记账。</p>
            <button class="ledger-primary-button" type="button" data-ledger-action="open-members">添加同行人</button>
          </div>`}
      </section>`;
  }

  function formatBillDate(value) {
    if (!value) return "未填写时间";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value.replace("T", " ");
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(parsed);
  }

  function renderBillNoteControl(bill, options = {}) {
    const editing = options.editing ?? editingNoteBillId === bill.id;
    const value = options.value ?? bill.note ?? "";
    return editing ? `
      <form class="ledger-bill-note-form" data-ledger-form="bill-note" data-ledger-id="${escapeAttribute(bill.id)}">
        <span>备注：</span>
        <input name="note" maxlength="160" autocomplete="off" value="${escapeAttribute(value)}" placeholder="暂无">
        <button type="submit" aria-label="保存备注">✓</button>
        <button type="button" data-ledger-action="cancel-note-edit" aria-label="取消修改备注">×</button>
      </form>` : `
      <button class="ledger-bill-note-trigger" type="button" data-ledger-action="edit-bill-note" data-ledger-id="${escapeAttribute(bill.id)}" aria-label="编辑备注：${escapeAttribute(bill.note || "暂无")}">
        <span>备注：</span><span>${escapeHtml(bill.note || "暂无")}</span>
      </button>`;
  }

  function billRowById(id) {
    return [...(ledgerRoot?.querySelectorAll("[data-ledger-bill-id]") || [])]
      .find((row) => row.dataset.ledgerBillId === id) || null;
  }

  function replaceBillNoteControl(id, editing, value) {
    const bill = ledgerData.bills.find((entry) => entry.id === id);
    const row = billRowById(id);
    const current = row?.querySelector(".ledger-bill-note-trigger, .ledger-bill-note-form");
    if (!bill || !current) return null;
    const template = document.createElement("template");
    template.innerHTML = renderBillNoteControl(bill, { editing, value }).trim();
    const replacement = template.content.firstElementChild;
    current.replaceWith(replacement);
    return replacement;
  }

  function activeBillNoteForm() {
    return editingNoteBillId
      ? ledgerRoot?.querySelector('[data-ledger-form="bill-note"]') || null
      : null;
  }

  function focusBillNoteForm(form) {
    const input = form?.querySelector('input[name="note"]');
    input?.focus({ preventScroll: true });
    input?.select();
  }

  async function flushActiveBillNote() {
    if (pendingNoteSave) return pendingNoteSave;
    const form = activeBillNoteForm();
    if (!form) {
      editingNoteBillId = null;
      return true;
    }
    return submitBillNote(form);
  }

  async function openBillNoteEditor(id) {
    const request = ++noteOpenRequest;
    const bill = ledgerData.bills.find((entry) => entry.id === id);
    if (!bill) return;
    if (editingBillId === id) {
      const fullBillNote = ledgerRoot.querySelector('[data-ledger-form="bill"] input[name="note"]');
      fullBillNote?.scrollIntoView({ behavior: "smooth", block: "center" });
      fullBillNote?.focus({ preventScroll: true });
      fullBillNote?.select();
      return;
    }
    if (editingNoteBillId === id) {
      focusBillNoteForm(activeBillNoteForm());
      return;
    }
    if (!(await flushActiveBillNote()) || request !== noteOpenRequest) return;
    editingNoteBillId = id;
    const editor = replaceBillNoteControl(id, true, bill.note || "");
    focusBillNoteForm(editor);
  }

  function cancelBillNoteEditor() {
    noteOpenRequest += 1;
    const id = editingNoteBillId;
    editingNoteBillId = null;
    if (id) replaceBillNoteControl(id, false);
  }

  function handleDocumentPointerDown(event) {
    const form = activeBillNoteForm();
    if (!form || form.contains(event.target)) return;
    const actionTarget = event.target.closest?.("[data-ledger-action]");
    if (actionTarget?.dataset.ledgerAction === "delete-bill") {
      cancelBillNoteEditor();
      return;
    }
    const nextNote = event.target.closest?.('[data-ledger-action="edit-bill-note"]');
    if (nextNote && ledgerRoot?.contains(nextNote)) return;
    void flushActiveBillNote();
  }

  function renderBillRow(bill) {
    const payer = travelerById(bill.payerId);
    const participants = bill.participantIds.map(travelerById).filter(Boolean);
    const baseCurrency = ledgerData.settings.baseCurrency;
    const isChecked = billMultiMode && billSelectedIds.has(bill.id);
    return `
      <article class="ledger-bill-row${billMultiMode ? " ledger-multi" : ""}${isChecked ? " ledger-is-selected" : ""}" data-ledger-bill-id="${escapeAttribute(bill.id)}">
        ${billMultiMode ? `<button type="button" class="ledger-bill-check${isChecked ? " ledger-is-checked" : ""}" data-ledger-action="toggle-bill-select" data-ledger-id="${escapeAttribute(bill.id)}" aria-pressed="${isChecked}">${isChecked ? "✓" : ""}</button>` : ""}
        <div class="ledger-bill-main">
          <div class="ledger-bill-title-row">
            <span class="ledger-category-mark" data-ledger-category="${escapeAttribute(bill.category)}" aria-hidden="true"></span>
            <div>
              <h3>${escapeHtml(bill.category)}</h3>
              ${renderBillNoteControl(bill)}
              ${bill.orderedAt ? `<p class="ledger-bill-date">${escapeHtml(formatBillDate(bill.orderedAt))}</p>` : ""}
            </div>
          </div>
          <div class="ledger-bill-amount">
            <strong>${escapeHtml(formatMoney(bill.originalAmountCents, bill.currency))}</strong>
            ${bill.currency !== baseCurrency ? `<span>折合 ${escapeHtml(formatMoney(bill.baseAmountCents, baseCurrency))}</span>` : ""}
          </div>
        </div>
        <div class="ledger-bill-people">
          <div class="ledger-bill-payer">
            <span>买单</span>
            ${renderAvatar(payer, "small")}
            <b>${escapeHtml(payer?.name || "")}</b>
          </div>
          <div class="ledger-bill-participants" aria-label="参与分账：${escapeAttribute(participants.map((person) => person.name).join("、"))}">
            <span>分账</span>
            <span class="ledger-avatar-stack">${participants.map((person) => renderAvatar(person, "tiny")).join("")}</span>
            <b>${participants.length} 人</b>
          </div>
        </div>
        <div class="ledger-row-actions">
          <button class="ledger-text-button" type="button" data-ledger-action="edit-bill" data-ledger-id="${escapeAttribute(bill.id)}">编辑账单</button>
          <button class="ledger-text-button ledger-danger-button" type="button" data-ledger-action="delete-bill" data-ledger-id="${escapeAttribute(bill.id)}">删除</button>
        </div>
      </article>`;
  }

  function renderBillList() {
    const baseCurrency = ledgerData.settings.baseCurrency;
    const totalCents = ledgerData.bills.reduce((sum, bill) => sum + bill.baseAmountCents, 0);
    const bills = [...ledgerData.bills].sort((first, second) => {
      const firstDate = first.orderedAt || first.createdAt;
      const secondDate = second.orderedAt || second.createdAt;
      return secondDate.localeCompare(firstDate);
    });
    const catMark = { "餐饮": "🍜", "交通": "🚕", "住宿": "🏨", "门票": "🎫", "购物": "🛍️", "其他": "📦" };
    const filtered = billCatFilter === "__all" ? bills
      : billCatFilter === "__personal" ? bills.filter(isPersonalBill)
      : bills.filter((b) => b.category === billCatFilter);
    const dayMap = new Map();
    filtered.forEach((b) => {
      const key = String(b.orderedAt || "").slice(0, 10) || "未标日期";
      const list = dayMap.get(key) || [];
      list.push(b);
      dayMap.set(key, list);
    });
    const dayEntries = [...dayMap.entries()].sort((a, b) => {
      if (a[0] === "未标日期") return 1;
      if (b[0] === "未标日期") return -1;
      return b[0].localeCompare(a[0]);
    });
    const dayLabel = (key) => {
      const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? `${+m[2]}月${+m[3]}日` : key;
    };
    const groupedHtml = dayEntries.map(([day, list]) => {
      const dayTotal = list.reduce((s, b) => s + b.baseAmountCents, 0);
      const dayVnd = list.filter((b) => b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0);
      return `
      <details class="ledger-bill-day" ${billMultiMode ? "open" : ""}>
        <summary class="ledger-bill-day-summary">
          <span class="ledger-bill-day-date">${escapeHtml(dayLabel(day))}</span>
          <span class="ledger-bill-day-meta">${list.length} 笔</span>
          <b class="ledger-bill-day-total">${escapeHtml(formatMoney(dayTotal, baseCurrency))}${dayVnd ? `<small class="ledger-day-vnd">${escapeHtml(formatMoney(dayVnd, "VND"))}</small>` : ""}</b>
        </summary>
        <div class="ledger-bill-day-list">${list.map(renderBillRow).join("")}</div>
      </details>`;
    }).join("");
    const countOf = (c) => bills.filter((b) => b.category === c).length;
    const personalCount = bills.filter(isPersonalBill).length;
    const tabBtn = (value, label, count) => `
      <button type="button" class="ledger-cat-tab${billCatFilter === value ? " ledger-is-active" : ""}" data-ledger-action="filter-bill-cat" data-ledger-cat="${escapeAttribute(value)}">${label}${count ? ` <small>${count}</small>` : ""}</button>`;
    const tabs = `
      <div class="ledger-cat-tabs" role="tablist" aria-label="按类别筛选账单">
        ${tabBtn("__all", "全部", bills.length)}
        ${tabBtn("__personal", "🧍 个人单独", personalCount)}
        ${CATEGORIES.map((c) => tabBtn(c, `${catMark[c] || ""} ${escapeHtml(c)}`, countOf(c))).join("")}
      </div>`;
    return `
      <section class="ledger-list-section" aria-labelledby="ledger-list-title">
        <div class="ledger-section-heading ledger-list-heading">
          <div>
            <p class="ledger-section-kicker">账单明细</p>
            <h2 id="ledger-list-title">${bills.length ? `${bills.length} 笔账单` : "还没有账单"}</h2>
          </div>
          <div class="ledger-list-total">
            <span>总支出</span>
            <strong>${escapeHtml(formatMoney(totalCents, baseCurrency))}</strong>
          </div>
        </div>
        ${bills.length ? `
          <div class="ledger-bill-tools">
            <button type="button" class="ledger-text-button${billMultiMode ? " ledger-is-active" : ""}" data-ledger-action="toggle-bill-multi">${billMultiMode ? "完成" : "☑ 多选删除"}</button>
          </div>
          ${tabs}
          ${filtered.length
            ? `<div class="ledger-bill-list">${groupedHtml}</div>`
            : `<div class="ledger-empty-state"><p>该类别还没有账单。</p></div>`}
          ${billMultiMode ? `
          <div class="ledger-multi-bar" data-ledger-multi-bar>
            <button type="button" class="ledger-text-button" data-ledger-action="bill-select-all">${filtered.length && filtered.every((b) => billSelectedIds.has(b.id)) ? "取消全选" : "全选本页"}</button>
            <button type="button" class="ledger-danger-button" data-ledger-action="delete-bills-selected" ${billSelectedIds.size ? "" : "disabled"}>删除所选${billSelectedIds.size ? ` ${billSelectedIds.size} 笔` : ""}</button>
          </div>` : ""}
        ` : `<div class="ledger-empty-state"><p>记下第一笔花费后，账单会按类别筛选显示在这里。</p></div>`}
      </section>`;
  }

  function renderEntryPage() {
    return `
      <section class="ledger-tab-panel" data-ledger-panel="entry" role="tabpanel" aria-labelledby="ledger-entry-tab" ${activeTab === "entry" ? "" : "hidden"}>
        <section class="ledger-members-strip" aria-label="本次同行人">
          <div class="ledger-members-strip-heading">
            <div><strong>同行人</strong><span>${ledgerData.travelers.length} 人</span></div>
            <button class="ledger-text-button" type="button" data-ledger-action="open-members">管理</button>
          </div>
          <div class="ledger-members-inline">
            ${ledgerData.travelers.map((traveler) => `<div class="ledger-person-static">${renderAvatar(traveler)}<span>${escapeHtml(traveler.name)}</span></div>`).join("")}
            <button class="ledger-add-person" type="button" data-ledger-action="open-members" aria-label="添加同行人"><span aria-hidden="true">＋</span><small>添加</small></button>
          </div>
        </section>
        ${renderBillForm()}
        ${renderBillList()}
      </section>`;
  }

  function renderRelatedBills(member) {
    if (!member.billIds.length) return `<p class="ledger-member-empty">暂无相关账单</p>`;
    return member.billIds.map((billId) => {
      const bill = ledgerData.bills.find((entry) => entry.id === billId);
      if (!bill) return "";
      const share = billShares(bill).get(member.traveler.id) || 0;
      return `
        <div class="ledger-member-bill">
          <span>${escapeHtml(bill.category)}${bill.payerId === member.traveler.id ? " · 买单" : ""}</span>
          <span>${share ? `分摊 ${escapeHtml(formatMoney(share, ledgerData.settings.baseCurrency))}` : "未参与分摊"}</span>
        </div>`;
    }).join("");
  }


  function renderExpenseCharts(bills, baseCurrency) {
    if (!bills.length) return "";
    const catMark = { "餐饮": "🍜", "交通": "🚕", "住宿": "🏨", "门票": "🎫", "购物": "🛍️", "其他": "📦" };
    const fmtCompact = (cents) => {
      const v = Math.round(cents / 100);
      if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
      if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
      return String(v);
    };
    const dayLabel = (k) => {
      const m = k.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? `${+m[2]}/${+m[3]}` : "无日期";
    };
    // 每日柱状图
    const dayMap = new Map();
    bills.forEach((b) => {
      const k = String(b.orderedAt || "").slice(0, 10) || "未标日期";
      dayMap.set(k, (dayMap.get(k) || 0) + b.baseAmountCents);
    });
    const dayEntries = [...dayMap.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const maxDay = Math.max(...dayEntries.map((e) => e[1]));
    const bars = dayEntries.map(([k, v]) => `
      <div class="ledger-bar-col">
        <span class="ledger-bar-val">¥${escapeHtml(fmtCompact(v))}</span>
        <div class="ledger-bar" style="height:${maxDay ? Math.max(5, Math.round((v / maxDay) * 100)) : 0}%"></div>
        <span class="ledger-bar-label">${escapeHtml(dayLabel(k))}</span>
      </div>`).join("");
    // 类别分布
    const catMap = new Map();
    bills.forEach((b) => catMap.set(b.category, (catMap.get(b.category) || 0) + b.baseAmountCents));
    const totalCents = bills.reduce((s, b) => s + b.baseAmountCents, 0);
    const catRows = CATEGORIES.filter((c) => catMap.get(c)).map((c) => {
      const v = catMap.get(c);
      const pct = totalCents ? Math.max(2, Math.round((v / totalCents) * 100)) : 0;
      const vnd = bills.filter((b) => b.category === c && b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0);
      return `
        <div class="ledger-cat-chart-row" data-cat="${escapeAttribute(c)}">
          <span class="ledger-cat-chart-name">${catMark[c] || ""} ${escapeHtml(c)}</span>
          <div class="ledger-cat-chart-track"><i style="width:${pct}%"></i></div>
          <span class="ledger-cat-chart-amt">${escapeHtml(formatMoney(v, baseCurrency))}${vnd ? `<small class="ledger-day-vnd">${escapeHtml(formatMoney(vnd, "VND"))}</small>` : ""}</span>
        </div>`;
    }).join("");
    return `
      <section class="ledger-summary-section ledger-chart-section" aria-label="消费图表">
        <div class="ledger-section-heading">
          <div><p class="ledger-section-kicker">消费情况</p><h2>📊 图表总览</h2></div>
        </div>
        <h3 class="ledger-chart-title">每日花销</h3>
        <div class="ledger-bar-chart">${bars}</div>
        <h3 class="ledger-chart-title">类别分布</h3>
        <div class="ledger-cat-chart">${catRows}</div>
      </section>`;
  }

  function renderSummaryPage() {
    const travelers = ledgerData.travelers;
    const allBills = ledgerData.bills;
    const baseCurrency = ledgerData.settings.baseCurrency;
    const bills = summaryScope === "all" ? allBills
      : summaryScope === "fh" ? allBills.filter(isFlightHotelBill)
      : allBills.filter((b) => !isFlightHotelBill(b));
    const scopeLabel = summaryScope === "all" ? "全部花费"
      : summaryScope === "fh" ? "机酒花费（不含当地消费）" : "当地消费（不含机票酒店）";
    const totalCents = bills.reduce((s, b) => s + b.baseAmountCents, 0);
    const days = new Set(bills.map((b) => String(b.orderedAt || "").slice(0, 10))).size;

    const perPerson = travelers
      .map((t) => ({
        t,
        paid: bills.filter((b) => b.payerId === t.id).reduce((s, b) => s + b.baseAmountCents, 0),
        paidVnd: bills.filter((b) => b.payerId === t.id && b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0)
      }))
      .sort((a, b) => b.paid - a.paid);
    const personHtml = travelers.length
      ? perPerson.map(({ t, paid, paidVnd }) => `
        <div class="ledger-person-row">
          ${renderAvatar(t, "small")}
          <span>${escapeHtml(t.name)}</span>
          <b>${escapeHtml(formatMoney(paid, baseCurrency))}${paidVnd ? `<small class="ledger-day-vnd">${escapeHtml(formatMoney(paidVnd, "VND"))}</small>` : ""}</b>
        </div>`).join("")
      : `<p class="ledger-empty">先在"记账"页添加同行人。</p>`;

    const dayMap = new Map();
    bills.forEach((b) => {
      const key = String(b.orderedAt || "").slice(0, 10) || "未标日期";
      const list = dayMap.get(key) || [];
      list.push(b);
      dayMap.set(key, list);
    });
    const dayEntries = [...dayMap.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const catMark = { "餐饮": "🍜", "交通": "🚕", "住宿": "🏨", "门票": "🎫", "购物": "🛍️", "其他": "📦" };
    const dayHtml = dayEntries.map(([day, dayBills], di) => {
      const dayTotal = dayBills.reduce((s, b) => s + b.baseAmountCents, 0);
      const dayVnd = dayBills.filter((b) => b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0);
      const catGroups = CATEGORIES
        .map((c) => ({ c, list: dayBills.filter((b) => b.category === c) }))
        .filter((g) => g.list.length);
      const inner = catGroups.map((g) => {
        const catTotal = g.list.reduce((s, b) => s + b.baseAmountCents, 0);
        const catVnd = g.list.filter((b) => b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0);
        const rows = g.list.map((b) => {
          const payer = travelerById(b.payerId);
          const parts = b.participantIds.map(travelerById).filter(Boolean);
          const amount = formatMoney(b.originalAmountCents, b.currency);
          const converted = b.currency !== baseCurrency ? `（${formatMoney(b.baseAmountCents, baseCurrency)}）` : "";
          return `<li class="ledger-day-bill">
            <div class="ledger-day-bill-top">
              <span class="ledger-day-bill-note">${escapeHtml(b.note || b.category)}</span>
              <b>${escapeHtml(amount)}${escapeHtml(converted)}</b>
            </div>
            <div class="ledger-day-bill-sub">
              <span>${escapeHtml(payer?.name || "")}付 · ${parts.map((p) => escapeHtml(p.name)).join("、")}分摊</span>
              <button type="button" class="ledger-day-del" data-ledger-action="delete-bill" data-ledger-id="${escapeAttribute(b.id)}">删除</button>
            </div>
          </li>`;
        }).join("");
        return `<div class="ledger-day-cat">
          <div class="ledger-day-cat-head"><span>${catMark[g.c] || ""} ${escapeHtml(g.c)}</span><b>${escapeHtml(formatMoney(catTotal, baseCurrency))}${catVnd ? `<small class="ledger-day-vnd">${escapeHtml(formatMoney(catVnd, "VND"))}</small>` : ""}</b></div>
          <ul class="ledger-day-bills">${rows}</ul>
        </div>`;
      }).join("");
      const dayPerPerson = new Map();
      const dayPerPersonVnd = new Map();
      dayBills.forEach((b) => {
        for (const [id, cents] of billShares(b)) {
          dayPerPerson.set(id, (dayPerPerson.get(id) || 0) + cents);
        }
        if (b.currency === "VND") {
          for (const [id, cents] of billShares(b, "originalAmountCents")) {
            dayPerPersonVnd.set(id, (dayPerPersonVnd.get(id) || 0) + cents);
          }
        }
      });
      const perPersonRow = travelers.length ? `
        <div class="ledger-day-perperson">
          <span class="ledger-day-perperson-label">每人当天承担</span>
          ${travelers.map((t) => {
            const c = dayPerPerson.get(t.id) || 0;
            const v = dayPerPersonVnd.get(t.id) || 0;
            return `<span class="ledger-day-person">${escapeHtml(t.name)} <b>${c ? escapeHtml(formatMoney(c, baseCurrency)) : "—"}${v ? `<small>${escapeHtml(formatMoney(v, "VND"))}</small>` : ""}</b></span>`;
          }).join("")}
        </div>` : "";
      return `<details class="ledger-day-group"${di === 0 ? " open" : ""}>
        <summary class="ledger-day-summary">
          <span class="ledger-day-date">${escapeHtml(day)}</span>
          <span class="ledger-day-meta">${dayBills.length} 笔</span>
          <b class="ledger-day-total">${escapeHtml(formatMoney(dayTotal, baseCurrency))}${dayVnd ? `<small class="ledger-day-vnd">${escapeHtml(formatMoney(dayVnd, "VND"))}</small>` : ""}</b>
        </summary>
        <div class="ledger-day-detail">${inner}${perPersonRow}</div>
      </details>`;
    }).join("");

    const scopeBtn = (value, label) => `
      <button type="button" class="ledger-scope-tab${summaryScope === value ? " ledger-is-active" : ""}" data-ledger-action="summary-scope" data-summary-scope="${value}">${label}</button>`;
    return `
      <section class="ledger-tab-panel ledger-summary-panel" data-ledger-panel="summary" role="tabpanel" aria-labelledby="ledger-summary-tab" ${activeTab === "summary" ? "" : "hidden"}>
        <div class="ledger-scope-tabs" role="tablist" aria-label="统计视角">
          ${scopeBtn("local", "🌴 当地消费")}
          ${scopeBtn("fh", "✈️ 机酒")}
          ${scopeBtn("all", "全部")}
        </div>
        <section class="ledger-stats-overview" aria-labelledby="ledger-summary-title">
          <p class="ledger-section-kicker">花费统计 · ${escapeHtml(scopeLabel)}</p>
          <h2 id="ledger-summary-title">${escapeHtml(formatMoney(totalCents, baseCurrency))}</h2>
          <span>${bills.length} 笔账单 · ${days} 天 · 以 ${escapeHtml(baseCurrency)} 结算</span>
          ${bills.some((b) => b.currency === "VND") ? `<span>其中越南盾 ${escapeHtml(formatMoney(bills.filter((b) => b.currency === "VND").reduce((s, b) => s + b.originalAmountCents, 0), "VND"))}</span>` : ""}
        </section>

        ${renderExpenseCharts(bills, baseCurrency)}

        <section class="ledger-summary-section">
          <div class="ledger-section-heading">
            <div><p class="ledger-section-kicker">个人花费</p><h2>每人掏了多少钱</h2></div>
          </div>
          <div class="ledger-person-list">${personHtml}</div>
        </section>

        <section class="ledger-summary-section">
          <div class="ledger-section-heading">
            <div><p class="ledger-section-kicker">每天花销</p><h2>每日花销一览</h2></div>
          </div>
          ${bills.length ? dayHtml : `<p class="ledger-empty">记下第一笔账单后，这里按天、按类别汇总，点开可看每笔明细。</p>`}
        </section>
      </section>`;
  }
  function renderStatsPage() {
    const stats = calculateStats();
    const baseCurrency = ledgerData.settings.baseCurrency;
    const pairs = couplePairs();
    const paired = pairs.length === 2;
    const allBills = ledgerData.bills;
    const settleMode = ledgerData.settings.settleMode === "couple" ? "couple" : "person";
    const settledDayKeys = Object.keys(ledgerData.settings.settlements || {}).filter((k) => Boolean(ledgerData.settings.settlements[k]));
    const pendingBills = allBills.filter((b) => {
      const key = String(b.orderedAt || "").slice(0, 10) || "未标日期";
      return !settledDayKeys.includes(key);
    });
    const settledCount = settledDayKeys.length;

    // ===== 结算方式选择器 =====
    const modeSwitch = `
      <section class="ledger-settlement-section ledger-mode-switch-section">
        <div class="ledger-section-heading">
          <div>
            <p class="ledger-section-kicker">结算方式</p>
            <h2>按什么方式结算</h2>
          </div>
        </div>
        <div class="ledger-mode-switch" role="tablist" aria-label="结算方式">
          <button type="button" class="${settleMode === "person" ? "ledger-is-active" : ""}" data-ledger-action="set-settle-mode" data-mode="person">👥 按人头</button>
          <button type="button" class="${settleMode === "couple" ? "ledger-is-active" : ""}" data-ledger-action="set-settle-mode" data-mode="couple">👫 按情侣对</button>
        </div>
        <p class="ledger-couple-note">${settleMode === "couple"
          ? (paired ? `当前配对：${ledgerData.settings.couples.map((pair) => escapeHtml(coupleLabel(pair))).join(" ｜ ")}（可点下方「设置配对」修改）` : "还没设置情侣对，点下方「设置配对」。")
          : "每人单独结算：谁垫付了、谁该分摊，多退少补。"}</p>
      </section>`;

    // ===== 每日结清清单（按当前模式） =====
    const dayMap = new Map();
    allBills.forEach((b) => {
      const key = String(b.orderedAt || "").slice(0, 10) || "未标日期";
      const list = dayMap.get(key) || [];
      list.push(b);
      dayMap.set(key, list);
    });
    const dayEntries = [...dayMap.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const dayLabel = (key) => {
      const m = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? `${+m[2]}月${+m[3]}日` : key;
    };
    const statusHtmlFor = (day) => {
      const settled = Boolean(ledgerData.settings.settlements?.[day]);
      return settled
        ? `<span class="ledger-settled-badge">已结清 ✓</span><button type="button" class="ledger-text-button ledger-danger-button" data-ledger-action="unmark-day-settled" data-day="${escapeAttribute(day)}">撤销</button>`
        : `<button type="button" class="ledger-secondary-button ledger-settle-btn" data-ledger-action="mark-day-settled" data-day="${escapeAttribute(day)}">✓ 标记已结清</button>`;
    };
    let dailySettleHtml = "";
    if (allBills.length) {
      const rows = dayEntries.map(([day, dayBills]) => {
        let lines;
        if (settleMode === "couple" && paired) {
          const [p1, p2] = pairs;
          const net1 = coupleNetFor(dayBills, p1);
          lines = net1 === 0
            ? `<span class="ledger-day-settle-amt ledger-neutral">两对已平，无需互转</span>`
            : net1 > 0
              ? `<span class="ledger-day-settle-amt">${escapeHtml(travelerById(p2[0]).name)} → ${escapeHtml(travelerById(p1[0]).name)} 转 ${moneyWithVnd(net1, baseCurrency)}</span>`
              : `<span class="ledger-day-settle-amt">${escapeHtml(travelerById(p1[0]).name)} → ${escapeHtml(travelerById(p2[0]).name)} 转 ${moneyWithVnd(-net1, baseCurrency)}</span>`;
        } else {
          const netById = new Map();
          ledgerData.travelers.forEach((t) => {
            const net = personNetFor(dayBills, t);
            if (net !== 0) netById.set(t.id, net);
          });
          const transfers = settleTransfersFor(netById);
          lines = transfers.length
            ? transfers.map((tr) => `<span class="ledger-day-settle-amt">${escapeHtml(travelerById(tr.fromId).name)} → ${escapeHtml(travelerById(tr.toId).name)} 转 ${moneyWithVnd(tr.amountCents, baseCurrency)}</span>`).join("")
            : `<span class="ledger-day-settle-amt ledger-neutral">已平，无需互转</span>`;
        }
        return `
          <div class="ledger-day-settle-row">
            <span class="ledger-day-settle-date">${escapeHtml(dayLabel(day))} <small>${dayBills.length} 笔</small></span>
            <div class="ledger-day-settle-main">${lines}</div>
            <div class="ledger-day-settle-status">${statusHtmlFor(day)}</div>
          </div>`;
      }).join("");
      dailySettleHtml = `
        <section class="ledger-settlement-section" aria-labelledby="ledger-daily-settle-title">
          <div class="ledger-section-heading">
            <div>
              <p class="ledger-section-kicker">每天结清</p>
              <h2 id="ledger-daily-settle-title">每日该转多少 · 是否已结</h2>
            </div>
          </div>
          <div class="ledger-day-settle-list">${rows}</div>
          <p class="ledger-couple-note">转完当天就点「标记已结清」，避免漏结；点「撤销」可取消。</p>
        </section>`;
    }

    // ===== 总结算区块（按当前模式） =====
    let summaryHtml = "";
    if (settleMode === "couple") {
      const setupHtml = `
      <section class="ledger-settlement-section ledger-couple-setup">
        <div class="ledger-section-heading">
          <div>
            <p class="ledger-section-kicker">情侣对</p>
            <h2>谁和谁是一对</h2>
          </div>
          <button type="button" class="ledger-secondary-button" data-ledger-action="open-couples">设置配对</button>
        </div>
        ${paired
          ? `<p class="ledger-couple-note">当前：${ledgerData.settings.couples.map((pair) => escapeHtml(coupleLabel(pair))).join(" ｜ ")}（结算按对合并）</p>`
          : `<p class="ledger-couple-note">还没设置情侣对。设置后结算会按对合并，两对之间只转一笔。</p>`}
      </section>`;
      let coupleSummaryHtml = "";
      if (paired) {
        const [p1, p2] = pairs;
        const b1 = coupleBreakdown(pendingBills, p1);
        const net1 = b1.net;
        const abs = Math.abs(net1);
        let direction = "";
        if (abs === 0) direction = `<div class="ledger-couple-line ledger-neutral">两对花费已平，无需转账。</div>`;
        else if (net1 > 0) direction = `<div class="ledger-couple-line">${escapeHtml(coupleLabel(p2))} 需转给 ${escapeHtml(coupleLabel(p1))} ${moneyWithVnd(net1, baseCurrency)}（${escapeHtml(travelerById(p2[0]).name)} → ${escapeHtml(travelerById(p1[0]).name)} 转一次即可）</div>`;
        else direction = `<div class="ledger-couple-line">${escapeHtml(coupleLabel(p1))} 需转给 ${escapeHtml(coupleLabel(p2))} ${moneyWithVnd(-net1, baseCurrency)}（${escapeHtml(travelerById(p1[0]).name)} → ${escapeHtml(travelerById(p2[0]).name)} 转一次即可）</div>`;
        const coupleRows = pairs.map((pair, idx) => {
          const b = idx === 0 ? b1 : coupleBreakdown(pendingBills, pair);
          return `
          <div class="ledger-breakdown-row">
            <div class="ledger-breakdown-head">
              <span class="ledger-breakdown-name">👫 ${escapeHtml(coupleLabel(pair))}</span>
              <span class="ledger-breakdown-net ${b.net > 0 ? "ledger-positive" : b.net < 0 ? "ledger-negative" : "ledger-neutral"}">${b.net > 0 ? "应收" : b.net < 0 ? "应付" : "已平"} ${moneyWithVnd(Math.abs(b.net), baseCurrency)}</span>
            </div>
            <div class="ledger-breakdown-steps">
              <span>垫付 ${moneyWithVnd(b.paid, baseCurrency)}</span>
              <span>−</span>
              <span>应分摊 ${moneyWithVnd(b.owed, baseCurrency)}</span>
            </div>
          </div>`;
        }).join("");
        coupleSummaryHtml = `
        <section class="ledger-settlement-section" aria-labelledby="ledger-couple-title">
          <div class="ledger-section-heading">
            <div>
              <p class="ledger-section-kicker">结算方案 · 按情侣对</p>
              <h2 id="ledger-couple-title">谁转给谁（只需一笔）</h2>
            </div>
            <span class="ledger-soft-count">👫 ${escapeHtml(coupleLabel(p1))} ｜ ${escapeHtml(coupleLabel(p2))}</span>
          </div>
          <div class="ledger-breakdown-list">
            <p class="ledger-breakdown-title">🧮 计算过程</p>
            <p class="ledger-breakdown-formula">每对合并垫付与分摊，净额 = 垫付 − 应分摊；净额为正的对是应收方，为负的对应付方，两对之间只需补差额。</p>
            ${coupleRows}
          </div>
          ${direction}
          ${settledCount ? `<p class="ledger-couple-note">已扣除已结清 ${settledCount} 天：这里只算还没结清的部分。</p>` : ""}
          <p class="ledger-couple-note">情侣内部的钱不分开算，两对之间只需代表互相转一笔。</p>
        </section>`;
      }
      summaryHtml = setupHtml + coupleSummaryHtml;
    } else {
      const netById = new Map();
      ledgerData.travelers.forEach((t) => {
        const net = personNetFor(pendingBills, t);
        if (net !== 0) netById.set(t.id, net);
      });
      const pendingTransfers = settleTransfersFor(netById);
      const breakdownRows = ledgerData.travelers.map((t) => {
        const b = personBreakdown(pendingBills, t);
        return `
          <div class="ledger-breakdown-row">
            <div class="ledger-breakdown-head">
              <span class="ledger-breakdown-name">${renderAvatar(t, "small")} ${escapeHtml(t.name)}</span>
              <span class="ledger-breakdown-net ${b.net > 0 ? "ledger-positive" : b.net < 0 ? "ledger-negative" : "ledger-neutral"}">${b.net > 0 ? "应收" : b.net < 0 ? "应付" : "已平"} ${moneyWithVnd(Math.abs(b.net), baseCurrency)}</span>
            </div>
            <div class="ledger-breakdown-steps">
              <span>垫付 ${moneyWithVnd(b.paid, baseCurrency)}</span>
              <span>−</span>
              <span>应分摊 ${moneyWithVnd(b.owed, baseCurrency)}</span>
            </div>
          </div>`;
      }).join("");
      summaryHtml = `
        <section class="ledger-settlement-section" aria-labelledby="ledger-settlement-title">
          <div class="ledger-section-heading">
            <div>
              <p class="ledger-section-kicker">结算方案 · 按人头</p>
              <h2 id="ledger-settlement-title">谁需要转给谁</h2>
            </div>
            <span class="ledger-soft-count">${pendingTransfers.length} 笔转账</span>
          </div>
          ${settledCount ? `<p class="ledger-couple-note">已扣除已结清 ${settledCount} 天：这里只算还没结清的部分。</p>` : ""}
          <div class="ledger-breakdown-list">
            <p class="ledger-breakdown-title">🧮 计算过程</p>
            <p class="ledger-breakdown-formula">净额 = 垫付 − 应分摊 · 正数应收（别人欠他），负数应付（他欠别人）</p>
            ${breakdownRows}
          </div>
          ${pendingTransfers.length ? `
            <div class="ledger-transfer-list">
              ${pendingTransfers.map((transfer) => {
                const from = travelerById(transfer.fromId);
                const to = travelerById(transfer.toId);
                return `
                  <div class="ledger-transfer-row">
                    <div class="ledger-transfer-person">
                      ${renderAvatar(from)}
                      <span><strong>${escapeHtml(from?.name || "")}</strong><small>转给 ${escapeHtml(to?.name || "")}</small></span>
                    </div>
                    <strong class="ledger-transfer-amount">${moneyWithVnd(transfer.amountCents, baseCurrency)}</strong>
                  </div>`;
              }).join("")}
            </div>` : `
            <div class="ledger-empty-state"><p>${ledgerData.bills.length ? "大家已经结清，无需转账。" : "添加账单后，这里会自动生成结算单。"}</p></div>`}
        </section>`;
    }

    return `
      <section class="ledger-tab-panel" data-ledger-panel="stats" role="tabpanel" aria-labelledby="ledger-stats-tab" ${activeTab === "stats" ? "" : "hidden"}>
        <section class="ledger-stats-overview" aria-labelledby="ledger-stats-title">
          <p class="ledger-section-kicker">账单结算</p>
          <h2 id="ledger-stats-title">${escapeHtml(formatMoney(stats.totalCents, baseCurrency))}</h2>
          <span>${ledgerData.bills.length} 笔账单 · 以 ${escapeHtml(baseCurrency)} 结算</span>
        </section>

        ${modeSwitch}
        ${summaryHtml}
        ${dailySettleHtml}

        <section class="ledger-member-stats-section" aria-labelledby="ledger-member-stats-title">
          <div class="ledger-section-heading">
            <div>
              <p class="ledger-section-kicker">成员消费明细</p>
              <h2 id="ledger-member-stats-title">每个人的收支</h2>
            </div>
          </div>
          ${stats.members.length ? `
            <div class="ledger-member-stats-list">
              ${stats.members.map((member) => `
                <details class="ledger-member-stat" open>
                  <summary class="ledger-member-stat-summary">
                    <span class="ledger-member-identity">${renderAvatar(member.traveler)}<strong>${escapeHtml(member.traveler.name)}</strong></span>
                    <span class="ledger-member-chevron" aria-hidden="true">›</span>
                  </summary>
                  <div class="ledger-member-stat-body">
                    <dl class="ledger-member-metrics">
                      <div><dt>实际支付</dt><dd>${moneyWithVnd(member.paidCents, baseCurrency)}</dd></div>
                      <div><dt>个人应分摊</dt><dd>${moneyWithVnd(member.owedCents, baseCurrency)}</dd></div>
                      <div><dt>结算结果</dt><dd class="${member.netCents > 0 ? "ledger-positive" : member.netCents < 0 ? "ledger-negative" : "ledger-neutral"}">${member.netCents > 0 ? "应收 " : member.netCents < 0 ? "应付 " : "已结清 "}${member.netCents === 0 ? "" : moneyWithVnd(Math.abs(member.netCents), baseCurrency)}</dd></div>
                    </dl>
                    <div class="ledger-member-bills">${renderRelatedBills(member)}</div>
                  </div>
                </details>`).join("")}
            </div>` : `<div class="ledger-empty-state"><p>添加同行人后，这里会显示每个人的收支。</p></div>`}
        </section>
      </section>`;
  }

  function renderMemberEditRow(traveler) {
    if (editingMemberId === traveler.id) {
      return `
        <form class="ledger-member-edit-row ledger-member-edit-row-is-open" data-ledger-form="member-edit" data-ledger-id="${escapeAttribute(traveler.id)}">
          ${renderAvatar(traveler)}
          <label class="ledger-visually-hidden" for="ledger-name-${escapeAttribute(traveler.id)}">成员姓名</label>
          <input class="ledger-input" id="ledger-name-${escapeAttribute(traveler.id)}" name="name" maxlength="30" value="${escapeAttribute(traveler.name)}" required>
          <label class="ledger-color-picker" title="修改头像颜色">
            <span class="ledger-visually-hidden">头像颜色</span>
            <input type="color" name="color" value="${escapeAttribute(traveler.color)}">
          </label>
          <button class="ledger-text-button" type="submit">完成</button>
          <button class="ledger-icon-button ledger-danger-button" type="button" data-ledger-action="delete-member" data-ledger-id="${escapeAttribute(traveler.id)}" aria-label="删除 ${escapeAttribute(traveler.name)}">删除</button>
        </form>`;
    }
    return `
      <div class="ledger-member-edit-row ledger-member-edit-row-static">
        ${renderAvatar(traveler)}
        <strong>${escapeHtml(traveler.name)}</strong>
        <span class="ledger-member-edit-actions">
          <button class="ledger-text-button" type="button" data-ledger-action="edit-member" data-ledger-id="${escapeAttribute(traveler.id)}">编辑</button>
          <button class="ledger-icon-button ledger-danger-button" type="button" data-ledger-action="delete-member" data-ledger-id="${escapeAttribute(traveler.id)}" aria-label="删除 ${escapeAttribute(traveler.name)}">删除</button>
        </span>
      </div>`;
  }

  function renderMembersDialog() {
    const suggestedColor = nextAvatarColor(ledgerData.travelers);
    return `
      <dialog class="ledger-dialog ledger-members-dialog" data-ledger-dialog="members" aria-labelledby="ledger-members-dialog-title">
        <div class="ledger-dialog-header">
          <div>
            <p class="ledger-section-kicker">同行人</p>
            <h2 id="ledger-members-dialog-title">管理本次成员</h2>
          </div>
          <button class="ledger-dialog-close" type="button" data-ledger-action="close-dialog" aria-label="关闭">×</button>
        </div>
        <div class="ledger-dialog-body">
          ${ledgerData.travelers.length ? `
            <div class="ledger-member-edit-list">
              ${ledgerData.travelers.map(renderMemberEditRow).join("")}
            </div>` : `<p class="ledger-dialog-empty">还没有同行人。</p>`}
          <form class="ledger-add-member-form" data-ledger-form="member-add">
            <div class="ledger-add-member-preview" data-ledger-member-preview style="--ledger-avatar-color:${escapeAttribute(suggestedColor)}">?</div>
            <label class="ledger-field ledger-add-member-name">
              <span class="ledger-field-label">添加成员</span>
              <input class="ledger-input" name="name" maxlength="30" placeholder="输入姓名" autocomplete="off" required>
            </label>
            <label class="ledger-color-picker" title="选择头像颜色">
              <span class="ledger-visually-hidden">头像颜色</span>
              <input type="color" name="color" value="${escapeAttribute(suggestedColor)}">
            </label>
            <button class="ledger-secondary-button" type="submit">添加</button>
          </form>
          <p class="ledger-dialog-note">头像文字会从姓名自动提取；颜色可以随时修改。</p>
        </div>
      </dialog>`;
  }

  function renderCurrencyChip(code) {
    const currency = currencyByCode(code);
    return `
      <span class="ledger-currency-chip">
        <b>${escapeHtml(code)}</b>
        <span>${escapeHtml(currency.nameZh)}</span>
        <button type="button" data-ledger-action="remove-common-currency" data-ledger-code="${escapeAttribute(code)}" aria-label="移除 ${escapeAttribute(currency.nameZh)}">×</button>
      </span>`;
  }

  function renderSettingsDialog() {
    const baseCurrency = currencyByCode(ledgerData.settings.baseCurrency);
    const baseLocked = ledgerData.bills.length > 0;
    return `
      <dialog class="ledger-dialog ledger-settings-dialog" data-ledger-dialog="settings" aria-labelledby="ledger-settings-dialog-title">
        <div class="ledger-dialog-header">
          <div>
            <p class="ledger-section-kicker">记账设置</p>
            <h2 id="ledger-settings-dialog-title">货币</h2>
          </div>
          <button class="ledger-dialog-close" type="button" data-ledger-action="close-dialog" aria-label="关闭">×</button>
        </div>
        <div class="ledger-dialog-body">
          <section class="ledger-setting-group">
            <div class="ledger-setting-heading">
              <div><h3>记账本位币</h3><p>统计与最终结算都使用这个币种</p></div>
            </div>
            <button class="ledger-currency-select-button" type="button" data-ledger-action="pick-base-currency" ${baseLocked ? "disabled" : ""}>
              <span class="ledger-currency-symbol">${escapeHtml(baseCurrency.symbol)}</span>
              <span><strong>${escapeHtml(baseCurrency.code)} · ${escapeHtml(baseCurrency.nameZh)}</strong><small>${escapeHtml(baseCurrency.nameEn)}</small></span>
              <span aria-hidden="true">›</span>
            </button>
            ${baseLocked ? `<p class="ledger-setting-note">已有账单后，本位币会锁定，避免历史换算金额失真。</p>` : ""}
          </section>
          <section class="ledger-setting-group">
            <div class="ledger-setting-heading">
              <div><h3>常用外币</h3><p>只在记账时显示你选中的币种</p></div>
              <button class="ledger-text-button" type="button" data-ledger-action="pick-common-currency">添加货币</button>
            </div>
            ${ledgerData.settings.commonCurrencies.length
              ? `<div class="ledger-currency-chips">${ledgerData.settings.commonCurrencies.map(renderCurrencyChip).join("")}</div>`
              : `<p class="ledger-dialog-empty">尚未添加常用外币。</p>`}
          </section>
        </div>
      </dialog>`;
  }

  function searchedCurrencies() {
    const query = normalizeSearch(currencyQuery);
    if (!query) return [];
    return CURRENCY_CATALOG
      .filter((currency) => currencySearchText.get(currency.code).includes(query))
      .slice(0, 24);
  }

  function currencyResultMarkup(currency) {
    const isBase = currency.code === ledgerData.settings.baseCurrency;
    const isSelected = currencyPickerMode === "base"
      ? isBase
      : ledgerData.settings.commonCurrencies.includes(currency.code);
    const disabled = currencyPickerMode === "common" && isBase;
    return `
      <button class="ledger-currency-result ${isSelected ? "ledger-is-selected" : ""}" type="button" data-ledger-action="choose-currency" data-ledger-code="${escapeAttribute(currency.code)}" ${disabled ? "disabled" : ""}>
        <span class="ledger-currency-symbol">${escapeHtml(currency.symbol)}</span>
        <span class="ledger-currency-result-name"><strong>${escapeHtml(currency.code)} · ${escapeHtml(currency.nameZh)}</strong><small>${escapeHtml(currency.nameEn)}</small></span>
        <span class="ledger-currency-result-state">${disabled ? "本位币" : isSelected ? "已选择" : "选择"}</span>
      </button>`;
  }

  function renderCurrencyResultsMarkup() {
    const currencies = searchedCurrencies();
    if (!normalizeSearch(currencyQuery)) {
      return `<div class="ledger-currency-empty"><p>输入货币名称开始查找</p><small>例如：港币、Hong Kong 或 HKD</small></div>`;
    }
    return currencies.length
      ? currencies.map(currencyResultMarkup).join("")
      : `<div class="ledger-currency-empty"><p>没有找到相关货币</p><small>可以尝试中文名、英文名、代码、符号或国家与地区。</small></div>`;
  }

  function renderCurrencyDialog() {
    return `
      <dialog class="ledger-dialog ledger-currency-dialog" data-ledger-dialog="currency" aria-labelledby="ledger-currency-dialog-title">
        <div class="ledger-dialog-header">
          <div>
            <p class="ledger-section-kicker">世界货币</p>
            <h2 id="ledger-currency-dialog-title">${currencyPickerMode === "base" ? "选择本位币" : "添加常用外币"}</h2>
          </div>
          <button class="ledger-dialog-close" type="button" data-ledger-action="back-to-settings" aria-label="返回设置">×</button>
        </div>
        <div class="ledger-dialog-body">
          <label class="ledger-currency-search">
            <span class="ledger-visually-hidden">搜索货币</span>
            <span aria-hidden="true">⌕</span>
            <input class="ledger-input" type="search" data-ledger-currency-search placeholder="搜索港币、Hong Kong、HKD…" value="${escapeAttribute(currencyQuery)}" autocomplete="off">
          </label>
          <p class="ledger-search-help">支持中文名、英文名、代码、符号和国家或地区</p>
          <div class="ledger-currency-results" data-ledger-currency-results>${renderCurrencyResultsMarkup()}</div>
        </div>
      </dialog>`;
  }

  function renderApp() {
    if (!ledgerRoot || !ledgerData) return;
    ledgerRoot.innerHTML = `
      <div class="ledger-app" data-ledger-trip-id="${escapeAttribute(ledgerTripId)}">
        <header class="ledger-page-header">
          <h1>旅行记账</h1>
          <div class="ledger-header-actions">
            <button class="ledger-icon-button" type="button" data-ledger-action="open-settings" aria-label="记账设置">设置</button>
          </div>
        </header>
        <nav class="ledger-tabs" role="tablist" aria-label="记账页面">
          <button id="ledger-entry-tab" class="ledger-tab ${activeTab === "entry" ? "ledger-is-active" : ""}" type="button" role="tab" aria-selected="${activeTab === "entry"}" data-ledger-action="set-tab" data-ledger-tab="entry">记账</button>
          <button id="ledger-stats-tab" class="ledger-tab ${activeTab === "stats" ? "ledger-is-active" : ""}" type="button" role="tab" aria-selected="${activeTab === "stats"}" data-ledger-action="set-tab" data-ledger-tab="stats">账单结算</button>
          <button id="ledger-summary-tab" class="ledger-tab ${activeTab === "summary" ? "ledger-is-active" : ""}" type="button" role="tab" aria-selected="${activeTab === "summary"}" data-ledger-action="set-tab" data-ledger-tab="summary">📊 统计</button>
        </nav>
        <div class="ledger-live" role="status" aria-live="polite">${escapeHtml(notice)}</div>
        ${renderEntryPage()}
        ${renderStatsPage()}
        ${renderSummaryPage()}
        ${renderMembersDialog()}
        ${renderParseDialog()}
        ${renderCouplesDialog()}
        ${renderSettingsDialog()}
        ${renderCurrencyDialog()}
      </div>`;
    syncSplitSummary();
    attachDialogBehavior();
    if (openDialogName) {
      const dialog = ledgerRoot.querySelector(`[data-ledger-dialog="${openDialogName}"]`);
      if (dialog) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        if (openDialogName === "currency") {
          const search = dialog.querySelector("[data-ledger-currency-search]");
          if (search) {
            search.focus({ preventScroll: true });
            search.setSelectionRange(search.value.length, search.value.length);
          }
        }
      }
    }
  }

  function setNotice(message) {
    notice = message;
    const live = ledgerRoot?.querySelector(".ledger-live");
    if (live) live.textContent = message;
  }

  function setFormError(form, message) {
    const target = form.querySelector("[data-ledger-form-error]");
    if (target) target.textContent = message;
    const live = ledgerRoot?.querySelector(".ledger-live");
    if (live) live.textContent = message;
  }

  function enqueueMutation(operation) {
    const queued = mutationQueue.then(operation, operation);
    mutationQueue = queued.catch(() => {});
    return queued;
  }

  async function mutateData(mutator, options = {}) {
    return enqueueMutation(async () => {
      const next = deepClone(ledgerData);
      mutator(next);
      next.version = STORAGE_VERSION;
      next.updatedAt = new Date().toISOString();
      try {
        await Promise.resolve(ledgerAdapter.save(next, { tripId: ledgerTripId }));
        ledgerData = normalizeData(next);
        if (typeof options.afterSuccess === "function") options.afterSuccess();
        notice = options.message || "";
        renderApp();
        ledgerRoot.dispatchEvent(new CustomEvent("travel-ledger:changed", {
          bubbles: true,
          detail: { tripId: ledgerTripId, reason: options.reason || "update", data: deepClone(ledgerData) }
        }));
        return true;
      } catch (error) {
        console.error("TravelLedger could not save data", error);
        setNotice(ledgerPersistenceMode === "d1"
          ? "保存失败，请检查网络或你的云端数据库配置后重试。"
          : "本地保存失败，请检查浏览器存储空间或隐私设置后重试。");
        return false;
      }
    });
  }

  function captureBillDraft() {
    if (!ledgerRoot || editingBillId) return;
    const form = ledgerRoot.querySelector('[data-ledger-form="bill"]');
    if (!form) return;
    const formData = new FormData(form);
    billDraft = {
      currency: String(formData.get("currency") || ledgerData.settings.lastCurrency),
      originalAmount: String(formData.get("originalAmount") || ""),
      baseAmount: String(formData.get("baseAmount") || ""),
      category: String(formData.get("category") || "餐饮"),
      note: String(formData.get("note") || "").trim().slice(0, 160),
      orderedAt: String(formData.get("orderedAt") || ""),
      payerId: String(formData.get("payerId") || ""),
      participantIds: formData.getAll("participantIds").map(String)
    };
  }

  function syncSplitSummary() {
    if (!ledgerRoot || !ledgerData) return;
    const form = ledgerRoot.querySelector('[data-ledger-form="bill"]');
    const summary = form?.querySelector("[data-ledger-split-summary]");
    if (!form || !summary) return;
    const participants = [...form.querySelectorAll('input[name="participantIds"]:checked')];
    if (!participants.length) {
      summary.textContent = "请选择至少一位分账人";
      return;
    }
    const currency = form.elements.currency?.value || ledgerData.settings.baseCurrency;
    const amountField = currency === ledgerData.settings.baseCurrency
      ? form.elements.originalAmount
      : form.elements.baseAmount;
    const amountCents = toCents(amountField?.value);
    if (!amountCents || amountCents <= 0) {
      summary.textContent = `已选 ${participants.length} 人 · 按人数平分`;
      return;
    }
    const averageCents = Math.floor(amountCents / participants.length);
    summary.textContent = `已选 ${participants.length} 人 · 每人约 ${formatMoney(averageCents, ledgerData.settings.baseCurrency)}`;
  }

  function syncCurrencyField(select) {
    const form = select.closest("form");
    if (!form) return;
    const convertedField = form.querySelector("[data-ledger-converted-field]");
    const convertedInput = form.querySelector('[data-ledger-field="base-amount"]');
    const isForeign = select.value !== ledgerData.settings.baseCurrency;
    if (convertedField) convertedField.hidden = !isForeign;
    if (convertedInput) {
      convertedInput.required = isForeign;
      if (!isForeign) convertedInput.value = "";
    }
    autoConvertBaseAmount(form);
    captureBillDraft();
    syncSplitSummary();
  }

  function syncMemberPreview(form) {
    const preview = form.querySelector("[data-ledger-member-preview]");
    if (!preview) return;
    const name = form.elements.name?.value || "";
    const color = form.elements.color?.value || nextAvatarColor(ledgerData.travelers);
    preview.textContent = name.trim() ? avatarInitial(name) : "?";
    if (isValidColor(color)) preview.style.setProperty("--ledger-avatar-color", color);
  }

  function attachDialogBehavior() {
    ledgerRoot.querySelectorAll("dialog[data-ledger-dialog]").forEach((dialog) => {
      dialog.addEventListener("close", () => {
        if (dialog.dataset.ledgerDialog === "members") editingMemberId = null;
        if (openDialogName === dialog.dataset.ledgerDialog) openDialogName = null;
      });
      dialog.addEventListener("cancel", () => {
        openDialogName = null;
      });
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });
  }

  function showDialog(name, { focusSearch = false } = {}) {
    if (!ledgerRoot) return;
    const dialog = ledgerRoot.querySelector(`[data-ledger-dialog="${name}"]`);
    if (!dialog) return;
    const current = ledgerRoot.querySelector("dialog[open]");
    if (current && current !== dialog) {
      openDialogName = null;
      if (typeof current.close === "function") current.close();
      else current.removeAttribute("open");
    }
    openDialogName = name;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    const focusTarget = focusSearch
      ? dialog.querySelector("[data-ledger-currency-search]")
      : dialog.querySelector("input:not([type=color]), button");
    requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
  }

  function closeDialog(dialog = ledgerRoot?.querySelector("dialog[open]")) {
    if (!dialog) {
      openDialogName = null;
      return;
    }
    if (dialog.dataset.ledgerDialog === "members") editingMemberId = null;
    openDialogName = null;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function updateCurrencyDialog(mode) {
    currencyPickerMode = mode;
    currencyQuery = "";
    const dialog = ledgerRoot.querySelector('[data-ledger-dialog="currency"]');
    if (!dialog) return;
    const title = dialog.querySelector("#ledger-currency-dialog-title");
    const search = dialog.querySelector("[data-ledger-currency-search]");
    const results = dialog.querySelector("[data-ledger-currency-results]");
    if (title) title.textContent = mode === "base" ? "选择本位币" : "添加常用外币";
    if (search) search.value = "";
    if (results) results.innerHTML = renderCurrencyResultsMarkup();
    showDialog("currency", { focusSearch: true });
  }

  function chooseBillCurrency(button) {
    const form = button.closest('[data-ledger-form="bill"]');
    const code = button.dataset.ledgerCode || "";
    if (!form || !availableCurrencyCodes(code).includes(code)) return;
    const field = form.querySelector('[data-ledger-field="currency"]');
    const display = form.querySelector("[data-ledger-currency-display]");
    const dropdown = button.closest("details");
    if (field) field.value = code;
    if (display) display.textContent = `${code} · ${currencyByCode(code).nameZh}`;
    dropdown?.removeAttribute("open");
    if (field) syncCurrencyField(field);
  }

  function isDuplicateTravelerName(name, ignoredId = "") {
    const normalized = name.trim().toLocaleLowerCase();
    return ledgerData.travelers.some((traveler) => (
      traveler.id !== ignoredId && traveler.name.trim().toLocaleLowerCase() === normalized
    ));
  }

  async function submitBill(form) {
    autoConvertBaseAmount(form);
    const formData = new FormData(form);
    const currency = String(formData.get("currency") || "").toUpperCase();
    const originalAmountCents = toCents(formData.get("originalAmount"));
    const isForeign = currency !== ledgerData.settings.baseCurrency;
    const baseAmountCents = isForeign ? toCents(formData.get("baseAmount")) : originalAmountCents;
    const category = String(formData.get("category") || "");
    const payerId = String(formData.get("payerId") || "");
    const participantIds = [...new Set(formData.getAll("participantIds").map(String))]
      .filter((id) => travelerById(id));

    if (!availableCurrencyCodes(currency).includes(currency)) {
      setFormError(form, "请选择本次旅程使用的币种。");
      return;
    }
    if (!originalAmountCents || originalAmountCents <= 0) {
      setFormError(form, "请输入正确的账单金额，最多保留两位小数。");
      form.elements.originalAmount?.focus();
      return;
    }
    if (!baseAmountCents || baseAmountCents <= 0) {
      setFormError(form, `请填写折合${currencyByCode(ledgerData.settings.baseCurrency).nameZh}的金额。`);
      form.elements.baseAmount?.focus();
      return;
    }
    if (!CATEGORIES.includes(category)) {
      setFormError(form, "请选择账单分类。");
      return;
    }
    if (!travelerById(payerId)) {
      setFormError(form, "请选择一位买单人。");
      return;
    }
    if (!participantIds.length) {
      setFormError(form, "请选择至少一位参与分账的人。");
      return;
    }

    const now = new Date().toISOString();
    const fields = {
      originalAmountCents,
      baseAmountCents,
      currency,
      category,
      note: String(formData.get("note") || "").trim().slice(0, 160),
      orderedAt: String(formData.get("orderedAt") || ""),
      payerId,
      participantIds,
      updatedAt: now
    };
    const billBeingEdited = ledgerData.bills.find((bill) => bill.id === editingBillId);
    await mutateData((next) => {
      if (billBeingEdited) {
        const index = next.bills.findIndex((bill) => bill.id === billBeingEdited.id);
        if (index >= 0) next.bills[index] = { ...next.bills[index], ...fields };
      } else {
        next.bills.push({ id: makeId("bill"), ...fields, createdAt: now });
        next.settings.lastCurrency = currency;
      }
    }, {
      reason: billBeingEdited ? "bill-updated" : "bill-added",
      message: billBeingEdited ? "账单已更新" : "账单已保存",
      afterSuccess() {
        editingBillId = null;
        billDraft = null;
      }
    });
  }

  async function submitMemberAdd(form) {
    const name = String(new FormData(form).get("name") || "").trim();
    const color = String(new FormData(form).get("color") || "").toUpperCase();
    if (!name) {
      form.elements.name?.focus();
      setNotice("请输入同行人的姓名。");
      return;
    }
    if (isDuplicateTravelerName(name)) {
      form.elements.name?.focus();
      setNotice("这位同行人已经添加过了。");
      return;
    }
    const id = makeId("person");
    const traveler = {
      id,
      name: name.slice(0, 30),
      initial: avatarInitial(name),
      color: isValidColor(color) ? color : nextAvatarColor(ledgerData.travelers)
    };
    captureBillDraft();
    if (billDraft) billDraft.participantIds = [...new Set([...billDraft.participantIds, id])];
    openDialogName = "members";
    await mutateData((next) => next.travelers.push(traveler), {
      reason: "member-added",
      message: `${traveler.name}已加入同行人`
    });
  }

  async function submitBillNote(form) {
    const id = form.dataset.ledgerId || "";
    const bill = ledgerData.bills.find((entry) => entry.id === id);
    if (!bill) return false;
    const note = String(new FormData(form).get("note") || "").trim().slice(0, 160);
    if (note === (bill.note || "")) {
      if (editingNoteBillId === id) editingNoteBillId = null;
      replaceBillNoteControl(id, false);
      return true;
    }
    if (pendingNoteSave) return pendingNoteSave;
    form.classList.add("ledger-is-saving");
    for (const control of form.elements) control.disabled = true;
    const operation = enqueueMutation(async () => {
      try {
        const latestBill = ledgerData.bills.find((entry) => entry.id === id);
        if (!latestBill) return false;
        if (note === (latestBill.note || "")) {
          if (editingNoteBillId === id) editingNoteBillId = null;
          replaceBillNoteControl(id, false);
          return true;
        }
        const now = new Date().toISOString();
        const next = deepClone(ledgerData);
        const target = next.bills.find((entry) => entry.id === id);
        if (!target) return false;
        target.note = note;
        target.updatedAt = now;
        next.version = STORAGE_VERSION;
        next.updatedAt = now;
        await Promise.resolve(ledgerAdapter.save(next, { tripId: ledgerTripId }));
        ledgerData = normalizeData(next);
        if (editingNoteBillId === id) editingNoteBillId = null;
        const fullBillNote = editingBillId === id
          ? ledgerRoot.querySelector('[data-ledger-form="bill"] input[name="note"]')
          : null;
        if (fullBillNote) fullBillNote.value = note;
        replaceBillNoteControl(id, false);
        setNotice(note ? "备注已更新" : "备注已清空");
        ledgerRoot.dispatchEvent(new CustomEvent("travel-ledger:changed", {
          bubbles: true,
          detail: { tripId: ledgerTripId, reason: "bill-note-updated", data: deepClone(ledgerData) }
        }));
        return true;
      } catch (error) {
        console.error("TravelLedger could not save note", error);
        form.classList.remove("ledger-is-saving");
        for (const control of form.elements) control.disabled = false;
        setNotice(ledgerPersistenceMode === "d1"
          ? "备注保存失败，请检查网络或你的云端数据库配置后重试。"
          : "备注本地保存失败，请检查浏览器存储空间或隐私设置后重试。");
        return false;
      }
    });
    pendingNoteSave = operation;
    operation.then(
      () => { if (pendingNoteSave === operation) pendingNoteSave = null; },
      () => { if (pendingNoteSave === operation) pendingNoteSave = null; }
    );
    return operation;
  }

  async function submitMemberEdit(form) {
    const id = form.dataset.ledgerId || "";
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const color = String(formData.get("color") || "").toUpperCase();
    if (!name) {
      form.elements.name?.focus();
      setNotice("姓名不能为空。");
      return;
    }
    if (isDuplicateTravelerName(name, id)) {
      form.elements.name?.focus();
      setNotice("已有同名的同行人，请换一个称呼。");
      return;
    }
    captureBillDraft();
    openDialogName = "members";
    await mutateData((next) => {
      const traveler = next.travelers.find((entry) => entry.id === id);
      if (!traveler) return;
      traveler.name = name.slice(0, 30);
      traveler.initial = avatarInitial(name);
      if (isValidColor(color)) traveler.color = color;
    }, { reason: "member-updated", message: "同行人信息已更新", afterSuccess() { editingMemberId = null; } });
  }

  async function submitCouples(form) {
    const travelers = ledgerData.travelers;
    const partnerOf = {};
    for (const t of travelers) {
      const sel = form.querySelector(`select[data-ledger-couple-for="${CSS.escape(t.id)}"]`);
      const v = sel?.value || "";
      if (v && travelerById(v)) partnerOf[t.id] = v;
    }
    const pairs = [];
    const used = new Set();
    for (const t of travelers) {
      const p = partnerOf[t.id];
      if (!p || used.has(t.id) || used.has(p)) continue;
      if (partnerOf[p] === t.id) {
        used.add(t.id);
        used.add(p);
        pairs.push([t.id, p]);
      }
    }
    openDialogName = "couples";
    await mutateData((next) => {
      next.settings.couples = pairs;
    }, {
      reason: "couples-updated",
      message: pairs.length
        ? `已设置 ${pairs.length} 对情侣：${pairs.map((pair) => pair.map(travelerById).map((x) => x.name).join("&")).join("、")}`
        : "已清空情侣对设置。"
    });
  }

  function confirmLedgerAction(message) {
    return new Promise((resolve) => {
      const dialog = document.createElement("dialog");
      dialog.className = "ledger-confirm-dialog";
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", "确认删除");
      dialog.innerHTML = `<div class="ledger-confirm-card">
        <p>${escapeHtml(message)}</p>
        <div class="ledger-confirm-actions">
          <button type="button" data-ledger-confirm="cancel">取消</button>
          <button type="button" class="ledger-confirm-danger" data-ledger-confirm="confirm">确认删除</button>
        </div>
      </div>`;
      let settled = false;
      const finish = (confirmed) => {
        if (settled) return;
        settled = true;
        if (dialog.open && typeof dialog.close === "function") dialog.close();
        dialog.remove();
        resolve(confirmed);
      };
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        finish(false);
      });
      dialog.addEventListener("click", (event) => {
        const choice = event.target.closest("[data-ledger-confirm]");
        if (choice) finish(choice.dataset.ledgerConfirm === "confirm");
        else if (event.target === dialog) finish(false);
      });
      document.body.append(dialog);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      requestAnimationFrame(() => dialog.querySelector('[data-ledger-confirm="cancel"]')?.focus());
    });
  }

  async function deleteMember(id) {
    const traveler = travelerById(id);
    if (!traveler) return;
    const referenced = ledgerData.bills.some((bill) => (
      bill.payerId === id || bill.participantIds.includes(id)
    ));
    if (referenced) {
      setNotice(`${traveler.name}已有相关账单，需先处理这些账单后才能删除。`);
      return;
    }
    if (!await confirmLedgerAction(`删除同行人“${traveler.name}”？`)) return;
    captureBillDraft();
    if (billDraft) {
      billDraft.participantIds = billDraft.participantIds.filter((memberId) => memberId !== id);
      if (billDraft.payerId === id) billDraft.payerId = "";
    }
    editingMemberId = null;
    openDialogName = "members";
    await mutateData((next) => {
      next.travelers = next.travelers.filter((entry) => entry.id !== id);
    }, { reason: "member-deleted", message: `${traveler.name}已移除` });
  }

  async function deleteSelectedBills() {
    const ids = [...billSelectedIds];
    if (!ids.length) return;
    if (!await confirmLedgerAction(`删除选中的 ${ids.length} 笔账单？`)) return;
    billMultiMode = false;
    await mutateData((next) => {
      next.bills = next.bills.filter((b) => !billSelectedIds.has(b.id));
    }, { reason: "bills-deleted", message: `已删除 ${ids.length} 笔账单`, afterSuccess() { billSelectedIds.clear(); } });
  }

  async function deleteBill(id) {
    const bill = ledgerData.bills.find((entry) => entry.id === id);
    if (!bill || !await confirmLedgerAction("删除这笔账单？")) return;
    if (editingNoteBillId === id) editingNoteBillId = null;
    await mutateData((next) => {
      next.bills = next.bills.filter((entry) => entry.id !== id);
    }, { reason: "bill-deleted", message: "账单已删除" });
  }

  async function removeCommonCurrency(code) {
    if (!ledgerData.settings.commonCurrencies.includes(code)) return;
    captureBillDraft();
    openDialogName = "settings";
    await mutateData((next) => {
      next.settings.commonCurrencies = next.settings.commonCurrencies.filter((item) => item !== code);
      if (next.settings.lastCurrency === code) next.settings.lastCurrency = next.settings.baseCurrency;
    }, { reason: "currency-removed", message: `${currencyByCode(code).nameZh}已移除` });
  }

  async function chooseCurrency(code) {
    if (!CURRENCY_BY_CODE.has(code)) return;
    captureBillDraft();
    if (currencyPickerMode === "base") {
      if (ledgerData.bills.length) {
        setNotice("已有账单，本位币不能再修改。");
        return;
      }
      openDialogName = "settings";
      await mutateData((next) => {
        next.settings.baseCurrency = code;
        next.settings.commonCurrencies = next.settings.commonCurrencies.filter((item) => item !== code);
        next.settings.lastCurrency = code;
      }, { reason: "base-currency-changed", message: `本位币已设为${currencyByCode(code).nameZh}` });
      return;
    }

    const selected = ledgerData.settings.commonCurrencies.includes(code);
    openDialogName = "currency";
    await mutateData((next) => {
      next.settings.commonCurrencies = selected
        ? next.settings.commonCurrencies.filter((item) => item !== code)
        : [...next.settings.commonCurrencies, code];
      if (selected && next.settings.lastCurrency === code) next.settings.lastCurrency = next.settings.baseCurrency;
    }, {
      reason: selected ? "currency-removed" : "currency-added",
      message: selected ? `${currencyByCode(code).nameZh}已移除` : `${currencyByCode(code).nameZh}已加入常用外币`
    });
  }

  function editBill(id) {
    if (!ledgerData.bills.some((bill) => bill.id === id)) return;
    if (editingBillId && editingBillId !== id) {
      setNotice("请先保存或取消正在编辑的账单。");
      ledgerRoot.querySelector('[data-ledger-form="bill"] [data-ledger-field="original-amount"]')?.focus({ preventScroll: true });
      return;
    }
    captureBillDraft();
    editingBillId = id;
    activeTab = "entry";
    notice = "";
    renderApp();
    requestAnimationFrame(() => {
      ledgerRoot.querySelector(".ledger-entry-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      ledgerRoot.querySelector('[data-ledger-field="original-amount"]')?.focus({ preventScroll: true });
    });
  }

  function handleAction(button) {
    const action = button.dataset.ledgerAction;
    if (!action) return;
    if (action === "set-tab") {
      captureBillDraft();
      setActiveTab(button.dataset.ledgerTab);
    } else if (action === "summary-scope") {
      summaryScope = button.dataset.summaryScope || "local";
      renderApp();
    } else if (action === "filter-bill-cat") {
      billCatFilter = button.dataset.ledgerCat || "__all";
      renderApp();
    } else if (action === "apply-template") {
      const tpl = QUICK_TEMPLATES.find((t) => t.id === button.dataset.ledgerTemplate);
      const form = ledgerRoot.querySelector('[data-ledger-form="bill"]');
      if (!tpl || !form) return;
      const catRadio = form.querySelector(`input[name="category"][value="${CSS.escape(tpl.category)}"]`);
      if (catRadio) catRadio.checked = true;
      const parts = form.querySelectorAll('input[name="participantIds"]');
      const payerRadios = [...form.querySelectorAll('input[name="payerId"]')];
      if (tpl.mode === "all") {
        parts.forEach((c) => { c.checked = true; });
        if (![...payerRadios].some((r) => r.checked) && payerRadios.length) payerRadios[0].checked = true;
      } else {
        parts.forEach((c) => { c.checked = false; });
        const first = payerRadios[0];
        if (first) {
          first.checked = true;
          const cb = [...parts].find((c) => c.value === first.value);
          if (cb) cb.checked = true;
        }
      }
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const dateInput = form.querySelector('input[name="orderedAt"]');
      if (dateInput && !dateInput.value) dateInput.value = today;
      const split = form.querySelector("[data-ledger-split-summary]");
      if (split) syncSplitSummary();
      setNotice(`已套用「${tpl.label}」：分类、分摊人、日期已填好，输入金额保存即可。`);
      const amount = form.querySelector('input[name="originalAmount"]');
      amount?.focus();
      amount?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (action === "open-parse") {
      parseDrafts = [];
      const input = ledgerRoot.querySelector("[data-parse-input]");
      if (input) input.value = "";
      renderParseRows();
      showDialog("parse");
    } else if (action === "close-parse") {
      closeDialog(button.closest("dialog"));
    } else if (action === "parse-run") {
      runParse();
    } else if (action === "parse-remove") {
      const idx = Number(button.dataset.parseIdx || 0);
      parseDrafts.splice(idx, 1);
      renderParseRows();
      setNotice(`已删除第 ${idx + 1} 行草稿，还剩 ${parseDrafts.length} 行。`);
    } else if (action === "parse-book-all") {
      const rows = [...ledgerRoot.querySelectorAll(".ledger-parse-row[data-parse-idx]")];
      const now = new Date().toISOString();
      const baseCurrency = ledgerData.settings.baseCurrency;
      const bills = [];
      const existing = new Set(ledgerData.bills.map(billSignature));
      let skipped = 0;
      let dup = 0;
      rows.forEach((row) => {
        const idx = Number(row.dataset.parseIdx || 0);
        const dr = parseDrafts[idx];
        if (!dr) return;
        const note = (row.querySelector('[data-parse-field="note"]')?.value || "").trim();
        const orderedAt = row.querySelector('[data-parse-field="orderedAt"]')?.value || "";
        const amountVal = parseFloat(row.querySelector('[data-parse-field="amount"]')?.value || "");
        const payerId = row.querySelector('[data-parse-field="payer"]')?.value || dr.payerId;
        const participantIds = [...row.querySelectorAll("[data-parse-part]:checked")].map((c) => c.dataset.parsePart);
        if (!(amountVal > 0)) { skipped += 1; return; }
        const currency = dr.currency === "VND" ? "VND" : baseCurrency;
        const originalAmountCents = Math.round(amountVal * 100);
        const baseAmountCents = currency === "VND" ? Math.round(amountVal * vndRate() * 100) : Math.round(amountVal * 100);
        const bill = {
          id: makeId("bill"),
          originalAmountCents,
          baseAmountCents,
          currency,
          category: dr.category,
          note: note || dr.note,
          orderedAt,
          payerId,
          participantIds: participantIds.length ? participantIds : [payerId],
          createdAt: now,
          updatedAt: now
        };
        const sig = billSignature(bill);
        if (existing.has(sig)) { dup += 1; return; }
        existing.add(sig);
        bills.push(bill);
      });
      if (!bills.length) {
        setNotice(`没有可入账的行：${skipped} 行未填金额${dup ? `，${dup} 笔与已有账单重复` : ""}。`);
        return;
      }
      mutateData((next) => { next.bills.push(...bills); }, {
        reason: "bill-added",
        message: `已入账 ${bills.length} 笔${skipped ? `，跳过 ${skipped} 行未填金额` : ""}${dup ? `，跳过 ${dup} 笔重复` : ""}。`,
        afterSuccess: () => {
          parseDrafts = [];
          const dialog = ledgerRoot.querySelector('[data-ledger-dialog="parse"]');
          if (dialog) closeDialog(dialog);
        }
      });
    } else if (action === "open-members") {
      captureBillDraft();
      showDialog("members");
    } else if (action === "set-settle-mode") {
      const mode = button.dataset.mode === "couple" ? "couple" : "person";
      mutateData((next) => {
        next.settings.settleMode = mode;
      }, { reason: "settle-mode", message: `结算方式已切换为「${mode === "couple" ? "按情侣对" : "按人头"}」。` });
    } else if (action === "open-couples") {
      showDialog("couples");
    } else if (action === "mark-day-settled") {
      const day = button.dataset.day || "";
      if (!day) return;
      mutateData((next) => {
        next.settings.settlements = { ...(next.settings.settlements || {}) };
        next.settings.settlements[day] = new Date().toISOString();
      }, { reason: "day-settled", message: `${day} 已标记结清。` });
    } else if (action === "unmark-day-settled") {
      const day = button.dataset.day || "";
      if (!day) return;
      mutateData((next) => {
        next.settings.settlements = { ...(next.settings.settlements || {}) };
        delete next.settings.settlements[day];
      }, { reason: "day-unsettled", message: `已撤销 ${day} 的结清标记。` });
    } else if (action === "open-settings") {
      captureBillDraft();
      showDialog("settings");
    } else if (action === "edit-member") {
      captureBillDraft();
      editingMemberId = button.dataset.ledgerId || null;
      openDialogName = "members";
      renderApp();
      requestAnimationFrame(() => ledgerRoot.querySelector('[data-ledger-form="member-edit"] input[name="name"]')?.focus());
    } else if (action === "close-dialog") {
      closeDialog(button.closest("dialog"));
    } else if (action === "back-to-settings") {
      closeDialog(button.closest("dialog"));
      showDialog("settings");
    } else if (action === "pick-base-currency") {
      updateCurrencyDialog("base");
    } else if (action === "pick-common-currency") {
      updateCurrencyDialog("common");
    } else if (action === "choose-bill-currency") {
      chooseBillCurrency(button);
    } else if (action === "choose-currency") {
      chooseCurrency(button.dataset.ledgerCode || "");
    } else if (action === "remove-common-currency") {
      removeCommonCurrency(button.dataset.ledgerCode || "");
    } else if (action === "delete-member") {
      deleteMember(button.dataset.ledgerId || "");
    } else if (action === "edit-bill") {
      editBill(button.dataset.ledgerId || "");
    } else if (action === "toggle-bill-multi") {
      billMultiMode = !billMultiMode;
      billSelectedIds.clear();
      renderApp();
    } else if (action === "toggle-bill-select") {
      const id = button.dataset.ledgerId || "";
      if (billSelectedIds.has(id)) billSelectedIds.delete(id);
      else billSelectedIds.add(id);
      const checked = billSelectedIds.has(id);
      const row = ledgerRoot.querySelector(`[data-ledger-bill-id="${CSS.escape(id)}"]`);
      row?.classList.toggle("ledger-is-selected", checked);
      button.classList.toggle("ledger-is-checked", checked);
      button.textContent = checked ? "✓" : "";
      button.setAttribute("aria-pressed", String(checked));
      const bar = ledgerRoot.querySelector("[data-ledger-multi-bar]");
      if (bar) {
        const del = bar.querySelector('[data-ledger-action="delete-bills-selected"]');
        if (del) {
          del.disabled = !billSelectedIds.size;
          del.textContent = `删除所选${billSelectedIds.size ? ` ${billSelectedIds.size} 笔` : ""}`;
        }
      }
    } else if (action === "bill-select-all") {
      const visible = [...ledgerRoot.querySelectorAll("[data-ledger-bill-id]")].map((el) => el.dataset.ledgerBillId);
      const all = visible.every((id) => billSelectedIds.has(id));
      visible.forEach((id) => { if (all) billSelectedIds.delete(id); else billSelectedIds.add(id); });
      renderApp();
    } else if (action === "delete-bills-selected") {
      void deleteSelectedBills();
    } else if (action === "delete-bill") {
      deleteBill(button.dataset.ledgerId || "");
    } else if (action === "edit-bill-note") {
      void openBillNoteEditor(button.dataset.ledgerId || "");
    } else if (action === "cancel-note-edit") {
      cancelBillNoteEditor();
    } else if (action === "cancel-edit") {
      editingBillId = null;
      renderApp();
    } else if (action === "select-all-participants") {
      const form = button.closest("form");
      const inputs = [...form.querySelectorAll('input[name="participantIds"]')];
      const shouldSelectAll = inputs.some((input) => !input.checked);
      inputs.forEach((input) => { input.checked = shouldSelectAll; });
      captureBillDraft();
      syncSplitSummary();
    }
  }

  async function handleRootClick(event) {
    const button = event.target.closest("[data-ledger-action]");
    if (!button || !ledgerRoot.contains(button)) return;
    event.preventDefault();
    const action = button.dataset.ledgerAction;
    const insideNoteForm = button.closest('[data-ledger-form="bill-note"]');
    if (editingNoteBillId
      && !insideNoteForm
      && action !== "edit-bill-note"
      && action !== "cancel-note-edit"
      && !(await flushActiveBillNote())) return;
    handleAction(button);
  }

  function handleRootInput(event) {
    if (event.target.matches("[data-ledger-currency-search]")) {
      currencyQuery = event.target.value;
      const results = ledgerRoot.querySelector("[data-ledger-currency-results]");
      if (results) results.innerHTML = renderCurrencyResultsMarkup();
      return;
    }
    const memberForm = event.target.closest('[data-ledger-form="member-add"]');
    if (memberForm) syncMemberPreview(memberForm);
    if (event.target.closest('[data-ledger-form="bill"]')) {
      if (event.target.matches('[data-ledger-field="original-amount"]')) {
        autoConvertBaseAmount(event.target.closest("form"));
      }
      captureBillDraft();
      syncSplitSummary();
    }
  }

  function handleRootChange(event) {
    if (event.target.matches('[data-ledger-field="currency"]')) syncCurrencyField(event.target);
    if (event.target.closest('[data-ledger-form="bill"]')) {
      captureBillDraft();
      syncSplitSummary();
    }
  }

  async function handleRootSubmit(event) {
    const form = event.target.closest("form[data-ledger-form]");
    if (!form || !ledgerRoot.contains(form)) return;
    event.preventDefault();
    if (form.dataset.ledgerForm === "bill-note") {
      await submitBillNote(form);
      return;
    }
    if (editingNoteBillId && !(await flushActiveBillNote())) return;
    if (form.dataset.ledgerForm === "bill") await submitBill(form);
    if (form.dataset.ledgerForm === "member-add") await submitMemberAdd(form);
    if (form.dataset.ledgerForm === "member-edit") await submitMemberEdit(form);
    if (form.dataset.ledgerForm === "couples") await submitCouples(form);
  }

  function handleRootKeydown(event) {
    if (event.key === "Escape" && event.target.closest('[data-ledger-form="bill-note"]')) {
      event.preventDefault();
      cancelBillNoteEditor();
      return;
    }
    if (!event.target.matches('[role="tab"]') || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const nextTab = event.target.dataset.ledgerTab === "entry" ? "stats" : "entry";
    setActiveTab(nextTab);
    requestAnimationFrame(() => ledgerRoot.querySelector(`[data-ledger-tab="${nextTab}"]`)?.focus());
  }

  function setActiveTab(tab, options = {}) {
    const nextTab = ["stats", "summary"].includes(tab) ? tab : "entry";
    if (editingNoteBillId && !options.skipNoteFlush) {
      void flushActiveBillNote().then((saved) => {
        if (saved) setActiveTab(nextTab, { ...options, skipNoteFlush: true });
      });
      return;
    }
    const changed = activeTab !== nextTab;
    if (changed) captureBillDraft();
    activeTab = nextTab;
    if (ledgerData && (changed || options.forceRender)) renderApp();
    if (options.updateHash !== false && changed) {
      window.dispatchEvent(new CustomEvent("travel-ledger:navigate", { detail: { tab: nextTab } }));
    }
  }

  async function init(options = {}) {
    const requestedRoot = typeof options.root === "string"
      ? document.querySelector(options.root)
      : options.root || document.querySelector("#ledger-root");
    if (!requestedRoot) return null;
    if (initialized && requestedRoot === ledgerRoot) return deepClone(ledgerData);

    ledgerRoot = requestedRoot;
    ledgerRoot.setAttribute("aria-busy", "true");
    const [resolvedTripId, tripConfig] = await Promise.all([
      resolveTripId(ledgerRoot, options),
      resolveTripConfig(ledgerRoot, options)
    ]);
    ledgerTripId = resolvedTripId;
    const persistence = resolvePersistence(ledgerRoot, options, tripConfig);
    ledgerAdapter = options.repository || options.adapter || (persistence.mode === "d1"
      ? createD1Adapter(ledgerTripId, persistence.d1Options)
      : createLocalStorageAdapter(ledgerTripId, persistence.localOptions));
    ledgerPersistenceMode = options.repository || options.adapter
      ? String(ledgerAdapter.mode || "custom")
      : persistence.mode;
    let stored = null;
    try {
      stored = await Promise.resolve(ledgerAdapter.load({ tripId: ledgerTripId }));
    } catch (error) {
      console.error("TravelLedger could not load data", error);
      notice = ledgerPersistenceMode === "d1"
        ? "共享账本暂时无法读取，请检查你的 Cloudflare D1 配置。"
        : "本地账本暂时无法读取，已打开一份空账本。";
    }
    ledgerData = normalizeData(stored);
    activeTab = location.hash === "#ledger-stats" ? "stats" : "entry";
    ledgerRoot.addEventListener("click", handleRootClick);
    ledgerRoot.addEventListener("input", handleRootInput);
    ledgerRoot.addEventListener("change", handleRootChange);
    ledgerRoot.addEventListener("submit", handleRootSubmit);
    ledgerRoot.addEventListener("keydown", handleRootKeydown);
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    initialized = true;
    renderApp();
    ledgerRoot.removeAttribute("aria-busy");
    return deepClone(ledgerData);
  }

  const publicApi = {
    init,
    setActiveTab,
    createLocalStorageAdapter,
    createD1Adapter,
    getPersistenceMode() {
      return ledgerPersistenceMode;
    },
    getSnapshot() {
      return ledgerData ? deepClone(ledgerData) : null;
    }
  };
  if (typeof module === "object" && module.exports) module.exports = publicApi;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  window.TravelLedger = publicApi;

  // The page controller initializes Ledger only when the module is enabled.
  // Standalone consumers can continue to call TravelLedger.init(options) explicitly.
})();
