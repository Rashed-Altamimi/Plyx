import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { Home } from './pages/Home'

// Converters
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })))
const QrGenerator       = lazy(() => import('./pages/QrGenerator').then(m => ({ default: m.QrGenerator })))
const DateTimeConverter = lazy(() => import('./pages/DateTimeConverter').then(m => ({ default: m.DateTimeConverter })))
const FileConverter     = lazy(() => import('./pages/FileConverter').then(m => ({ default: m.FileConverter })))
const HijriConverter    = lazy(() => import('./pages/HijriConverter').then(m => ({ default: m.HijriConverter })))
const UnitConverter     = lazy(() => import('./pages/UnitConverter').then(m => ({ default: m.UnitConverter })))
const CurrencyConverter = lazy(() => import('./pages/CurrencyConverter').then(m => ({ default: m.CurrencyConverter })))
const RomanNumerals     = lazy(() => import('./pages/RomanNumerals').then(m => ({ default: m.RomanNumerals })))
const WorldClock        = lazy(() => import('./pages/WorldClock').then(m => ({ default: m.WorldClock })))

// Text Tools
const CaseConverter   = lazy(() => import('./pages/CaseConverter').then(m => ({ default: m.CaseConverter })))
const JsonFormatter   = lazy(() => import('./pages/JsonFormatter').then(m => ({ default: m.JsonFormatter })))
const WordCounter     = lazy(() => import('./pages/WordCounter').then(m => ({ default: m.WordCounter })))
const MarkdownPreview = lazy(() => import('./pages/MarkdownPreview').then(m => ({ default: m.MarkdownPreview })))
const TextDiff        = lazy(() => import('./pages/TextDiff').then(m => ({ default: m.TextDiff })))
const RegexTester     = lazy(() => import('./pages/RegexTester').then(m => ({ default: m.RegexTester })))
const SortLines       = lazy(() => import('./pages/SortLines').then(m => ({ default: m.SortLines })))
const FindReplace     = lazy(() => import('./pages/FindReplace').then(m => ({ default: m.FindReplace })))
const SqlFormatter    = lazy(() => import('./pages/SqlFormatter').then(m => ({ default: m.SqlFormatter })))
const YamlJson        = lazy(() => import('./pages/YamlJson').then(m => ({ default: m.YamlJson })))
const MorseCode       = lazy(() => import('./pages/MorseCode').then(m => ({ default: m.MorseCode })))

// Dev Tools
const HashGenerator    = lazy(() => import('./pages/HashGenerator').then(m => ({ default: m.HashGenerator })))
const Base64Tool       = lazy(() => import('./pages/Base64Tool').then(m => ({ default: m.Base64Tool })))
const UrlEncodeTool    = lazy(() => import('./pages/UrlEncodeTool').then(m => ({ default: m.UrlEncodeTool })))
const JwtDecoder       = lazy(() => import('./pages/JwtDecoder').then(m => ({ default: m.JwtDecoder })))
const CronParser       = lazy(() => import('./pages/CronParser').then(m => ({ default: m.CronParser })))
const BaseConverter    = lazy(() => import('./pages/BaseConverter').then(m => ({ default: m.BaseConverter })))
const ColorConverter   = lazy(() => import('./pages/ColorConverter').then(m => ({ default: m.ColorConverter })))
const HttpStatus       = lazy(() => import('./pages/HttpStatus').then(m => ({ default: m.HttpStatus })))
const MimeTypes        = lazy(() => import('./pages/MimeTypes').then(m => ({ default: m.MimeTypes })))
const UserAgentParser  = lazy(() => import('./pages/UserAgentParser').then(m => ({ default: m.UserAgentParser })))
const HtmlEntities     = lazy(() => import('./pages/HtmlEntities').then(m => ({ default: m.HtmlEntities })))
const SubnetCalculator = lazy(() => import('./pages/SubnetCalculator').then(m => ({ default: m.SubnetCalculator })))
const JsonToTs         = lazy(() => import('./pages/JsonToTs').then(m => ({ default: m.JsonToTs })))

// Generators
const UuidGenerator      = lazy(() => import('./pages/UuidGenerator').then(m => ({ default: m.UuidGenerator })))
const LoremIpsum         = lazy(() => import('./pages/LoremIpsum').then(m => ({ default: m.LoremIpsum })))
const RandomNumber       = lazy(() => import('./pages/RandomNumber').then(m => ({ default: m.RandomNumber })))
const FakeData           = lazy(() => import('./pages/FakeData').then(m => ({ default: m.FakeData })))
const GradientGenerator  = lazy(() => import('./pages/GradientGenerator').then(m => ({ default: m.GradientGenerator })))
const BoxShadowGenerator = lazy(() => import('./pages/BoxShadowGenerator').then(m => ({ default: m.BoxShadowGenerator })))
const FaviconGenerator   = lazy(() => import('./pages/FaviconGenerator').then(m => ({ default: m.FaviconGenerator })))
const MetaTagGenerator   = lazy(() => import('./pages/MetaTagGenerator').then(m => ({ default: m.MetaTagGenerator })))

// Calculators
const AgeCalculator        = lazy(() => import('./pages/AgeCalculator').then(m => ({ default: m.AgeCalculator })))
const PercentageCalc       = lazy(() => import('./pages/PercentageCalc').then(m => ({ default: m.PercentageCalc })))
const LoanCalculator       = lazy(() => import('./pages/LoanCalculator').then(m => ({ default: m.LoanCalculator })))
const BmiCalculator        = lazy(() => import('./pages/BmiCalculator').then(m => ({ default: m.BmiCalculator })))
const TipCalculator        = lazy(() => import('./pages/TipCalculator').then(m => ({ default: m.TipCalculator })))
const DateDiff             = lazy(() => import('./pages/DateDiff').then(m => ({ default: m.DateDiff })))
const TimeDuration         = lazy(() => import('./pages/TimeDuration').then(m => ({ default: m.TimeDuration })))
const ScientificCalculator = lazy(() => import('./pages/ScientificCalculator').then(m => ({ default: m.ScientificCalculator })))
const PrimeChecker         = lazy(() => import('./pages/PrimeChecker').then(m => ({ default: m.PrimeChecker })))

// Image Tools
const ImageResizer    = lazy(() => import('./pages/ImageResizer').then(m => ({ default: m.ImageResizer })))
const ImageCompressor = lazy(() => import('./pages/ImageCompressor').then(m => ({ default: m.ImageCompressor })))
const ColorPicker     = lazy(() => import('./pages/ColorPicker').then(m => ({ default: m.ColorPicker })))
const ImageCropper    = lazy(() => import('./pages/ImageCropper').then(m => ({ default: m.ImageCropper })))
const ImageRotator    = lazy(() => import('./pages/ImageRotator').then(m => ({ default: m.ImageRotator })))
const SvgToPng        = lazy(() => import('./pages/SvgToPng').then(m => ({ default: m.SvgToPng })))
const ExifViewer      = lazy(() => import('./pages/ExifViewer').then(m => ({ default: m.ExifViewer })))
const PlaceholderImage = lazy(() => import('./pages/PlaceholderImage').then(m => ({ default: m.PlaceholderImage })))

// Fun
const CoinFlip       = lazy(() => import('./pages/CoinFlip').then(m => ({ default: m.CoinFlip })))
const DiceRoller     = lazy(() => import('./pages/DiceRoller').then(m => ({ default: m.DiceRoller })))
const DecisionMaker  = lazy(() => import('./pages/DecisionMaker').then(m => ({ default: m.DecisionMaker })))
const EmojiFinder    = lazy(() => import('./pages/EmojiFinder').then(m => ({ default: m.EmojiFinder })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-primary/25 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

function RoutesShell() {
  const location = useLocation()
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
            <Route path="/" element={<Home />} />

            {/* Converters */}
            <Route path="/password"    element={<PasswordGenerator />} />
            <Route path="/qr"          element={<QrGenerator />} />
            <Route path="/datetime"    element={<DateTimeConverter />} />
            <Route path="/files"       element={<FileConverter />} />
            <Route path="/hijri"       element={<HijriConverter />} />
            <Route path="/units"       element={<UnitConverter />} />
            <Route path="/currency"    element={<CurrencyConverter />} />
            <Route path="/roman"       element={<RomanNumerals />} />
            <Route path="/world-clock" element={<WorldClock />} />

            {/* Text Tools */}
            <Route path="/case"         element={<CaseConverter />} />
            <Route path="/json"         element={<JsonFormatter />} />
            <Route path="/word-count"   element={<WordCounter />} />
            <Route path="/markdown"     element={<MarkdownPreview />} />
            <Route path="/diff"         element={<TextDiff />} />
            <Route path="/regex"        element={<RegexTester />} />
            <Route path="/sort-lines"   element={<SortLines />} />
            <Route path="/find-replace" element={<FindReplace />} />
            <Route path="/sql"          element={<SqlFormatter />} />
            <Route path="/yaml"         element={<YamlJson />} />
            <Route path="/morse"        element={<MorseCode />} />

            {/* Dev Tools */}
            <Route path="/hash"          element={<HashGenerator />} />
            <Route path="/base64"        element={<Base64Tool />} />
            <Route path="/url-encode"    element={<UrlEncodeTool />} />
            <Route path="/jwt"           element={<JwtDecoder />} />
            <Route path="/cron"          element={<CronParser />} />
            <Route path="/base-convert"  element={<BaseConverter />} />
            <Route path="/color"         element={<ColorConverter />} />
            <Route path="/http-status"   element={<HttpStatus />} />
            <Route path="/mime"          element={<MimeTypes />} />
            <Route path="/user-agent"    element={<UserAgentParser />} />
            <Route path="/html-entities" element={<HtmlEntities />} />
            <Route path="/subnet"        element={<SubnetCalculator />} />
            <Route path="/json-ts"       element={<JsonToTs />} />

            {/* Generators */}
            <Route path="/uuid"       element={<UuidGenerator />} />
            <Route path="/lorem"      element={<LoremIpsum />} />
            <Route path="/random"     element={<RandomNumber />} />
            <Route path="/fake-data"  element={<FakeData />} />
            <Route path="/gradient"   element={<GradientGenerator />} />
            <Route path="/box-shadow" element={<BoxShadowGenerator />} />
            <Route path="/favicon"    element={<FaviconGenerator />} />
            <Route path="/meta-tags"  element={<MetaTagGenerator />} />

            {/* Calculators */}
            <Route path="/age"        element={<AgeCalculator />} />
            <Route path="/percentage" element={<PercentageCalc />} />
            <Route path="/loan"       element={<LoanCalculator />} />
            <Route path="/bmi"        element={<BmiCalculator />} />
            <Route path="/tip"        element={<TipCalculator />} />
            <Route path="/date-diff"  element={<DateDiff />} />
            <Route path="/duration"   element={<TimeDuration />} />
            <Route path="/scientific" element={<ScientificCalculator />} />
            <Route path="/prime"      element={<PrimeChecker />} />

            {/* Image Tools */}
            <Route path="/resize"      element={<ImageResizer />} />
            <Route path="/compress"    element={<ImageCompressor />} />
            <Route path="/color-pick"  element={<ColorPicker />} />
            <Route path="/crop"        element={<ImageCropper />} />
            <Route path="/rotate"      element={<ImageRotator />} />
            <Route path="/svg-png"     element={<SvgToPng />} />
            <Route path="/exif"        element={<ExifViewer />} />
            <Route path="/placeholder" element={<PlaceholderImage />} />

            {/* Fun */}
            <Route path="/coin-flip" element={<CoinFlip />} />
            <Route path="/dice"      element={<DiceRoller />} />
            <Route path="/decide"    element={<DecisionMaker />} />
            <Route path="/emoji"     element={<EmojiFinder />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <RoutesShell />
      </AppShell>
    </BrowserRouter>
  )
}
