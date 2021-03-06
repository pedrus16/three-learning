import { FileLoader, Loader } from "three";


enum ValueType {
  Uint8,
  Int8,
  Uint16,
  Int16,
  Uint32,
  Int32,
  Float32,
}

interface DataDescription {
  label?: string;
  type: ValueType | DataDescription[];
  length?: number;
  string?: boolean;
}

export type Vector3 = { x: number; y: number; z: number };
export type Color = { r: number; g: number; b: number };
export type Matrix = [
  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number,

  number,
  number,
  number,
  number
];

const BYTE_SIZES = {
  [ValueType.Uint8]: 1,
  [ValueType.Int8]: 1,
  [ValueType.Uint16]: 2,
  [ValueType.Int16]: 2,
  [ValueType.Uint32]: 4,
  [ValueType.Int32]: 4,
  [ValueType.Float32]: 4,
};

const MAIN_HEADER_SIZE_BYTE = 802;
const SECTION_HEADER_SIZE_BYTE = 28;
const LITTLE_ENDIAN = true;

const TS_NORMALS = [
  { x: 0.671213984489441, y: 0.198492005467415, z: -0.714193999767303 },
  { x: 0.269643008708954, y: 0.584393978118897, z: -0.765359997749329 },
  { x: -0.0405460000038147, y: 0.0969879999756813, z: -0.994458973407745 },
  { x: -0.572427988052368, y: -0.0919139981269836, z: -0.814786970615387 },
  { x: -0.171400994062424, y: -0.572709977626801, z: -0.801639020442963 },
  { x: 0.362556993961334, y: -0.30299898982048, z: -0.881331026554108 },
  { x: 0.810347020626068, y: -0.348971992731094, z: -0.470697999000549 },
  { x: 0.103961996734142, y: 0.938672006130218, z: -0.328767001628876 },
  { x: -0.32404699921608, y: 0.587669014930725, z: -0.741375982761383 },
  { x: -0.800864994525909, y: 0.340460985898972, z: -0.492646992206574 },
  { x: -0.665498018264771, y: -0.590147018432617, z: -0.456988990306854 },
  { x: 0.314767003059387, y: -0.803001999855042, z: -0.506072998046875 },
  { x: 0.972629010677338, y: 0.151076003909111, z: -0.176550000905991 },
  { x: 0.680290997028351, y: 0.684235990047455, z: -0.262726992368698 },
  { x: -0.520079016685486, y: 0.827777028083801, z: -0.210482999682426 },
  { x: -0.961643993854523, y: -0.179001003503799, z: -0.207846999168396 },
  { x: -0.262713998556137, y: -0.937451004981995, z: -0.228401005268097 },
  { x: 0.219706997275352, y: -0.971301019191742, z: 0.0911249965429306 },
  { x: 0.923807978630066, y: -0.229975000023842, z: 0.306086987257004 },
  { x: -0.0824889987707138, y: 0.970659971237183, z: 0.225866004824638 },
  { x: -0.591798007488251, y: 0.696789979934692, z: 0.405288994312286 },
  { x: -0.925296008586884, y: 0.36660099029541, z: 0.0971110016107559 },
  { x: -0.705051004886627, y: -0.687775015830994, z: 0.172828003764153 },
  { x: 0.732400000095367, y: -0.680366992950439, z: -0.0263049993664026 },
  { x: 0.855162024497986, y: 0.37458199262619, z: 0.358310997486114 },
  { x: 0.473006010055542, y: 0.836480021476746, z: 0.276704996824265 },
  { x: -0.0976170003414154, y: 0.654111981391907, z: 0.750072002410889 },
  { x: -0.904124021530151, y: -0.153724998235703, z: 0.398658007383347 },
  { x: -0.211915999650955, y: -0.858089983463287, z: 0.467732012271881 },
  { x: 0.500226974487305, y: -0.67440801858902, z: 0.543090999126434 },
  { x: 0.584538996219635, y: -0.110248997807503, z: 0.8038409948349 },
  { x: 0.437373012304306, y: 0.454643994569778, z: 0.775888979434967 },
  { x: -0.0424409992992878, y: 0.0833180025219917, z: 0.995618999004364 },
  { x: -0.596251010894775, y: 0.220131993293762, z: 0.772028028964996 },
  { x: -0.50645500421524, y: -0.396977007389069, z: 0.765448987483978 },
  { x: 0.0705690011382103, y: -0.478473991155624, z: 0.875262022018433 },
];

const RA2_NORMALS = [
  { x: 0.526578009128571, y: -0.359620988368988, z: -0.770317018032074 },
  { x: 0.150481998920441, y: 0.43598398566246, z: 0.887283980846405 },
  { x: 0.414195001125336, y: 0.738255023956299, z: -0.532374024391174 },
  { x: 0.0751520022749901, y: 0.916248977184296, z: -0.393498003482819 },
  { x: -0.316148996353149, y: 0.930736005306244, z: -0.183792993426323 },
  { x: -0.773819029331207, y: 0.623333990573883, z: -0.112510003149509 },
  { x: -0.900842010974884, y: 0.428537011146545, z: -0.0695680007338524 },
  { x: -0.998942017555237, y: -0.010971000418067, z: 0.0446650013327599 },
  { x: -0.979761004447937, y: -0.157670006155968, z: -0.123323999345303 },
  { x: -0.911274015903473, y: -0.362370997667313, z: -0.195620000362396 },
  { x: -0.624068975448608, y: -0.720941007137299, z: -0.301301002502441 },
  { x: -0.310173004865646, y: -0.809345006942749, z: -0.498751997947693 },
  { x: 0.146613001823425, y: -0.815819025039673, z: -0.559414029121399 },
  { x: -0.716516017913818, y: -0.694356024265289, z: -0.0668879970908165 },
  { x: 0.503971993923187, y: -0.114202000200748, z: -0.856136977672577 },
  { x: 0.455491006374359, y: 0.872627019882202, z: -0.176210999488831 },
  { x: -0.00500999996438622, y: -0.114372998476028, z: -0.993425011634827 },
  { x: -0.104675002396107, y: -0.32770100235939, z: -0.938965022563934 },
  { x: 0.560411989688873, y: 0.752588987350464, z: -0.345755994319916 },
  { x: -0.0605759993195534, y: 0.821627974510193, z: -0.566796004772186 },
  { x: -0.302341014146805, y: 0.797007024288178, z: -0.52284699678421 },
  { x: -0.671543002128601, y: 0.670740008354187, z: -0.314862996339798 },
  { x: -0.778401017189026, y: -0.128356993198395, z: 0.614504992961884 },
  { x: -0.924049973487854, y: 0.278382003307343, z: -0.261985003948212 },
  { x: -0.699773013591766, y: -0.550490975379944, z: -0.455278009176254 },
  { x: -0.568247973918915, y: -0.517189025878906, z: -0.640007972717285 },
  { x: 0.0540979988873005, y: -0.932864010334015, z: -0.356142997741699 },
  { x: 0.758382022380829, y: 0.572893023490906, z: -0.31088799238205 },
  { x: 0.00362000009045005, y: 0.305025994777679, z: -0.952337026596069 },
  { x: -0.0608499981462956, y: -0.986886024475098, z: -0.149510994553566 },
  { x: 0.635230004787445, y: 0.0454780012369156, z: -0.770982980728149 },
  { x: 0.521704971790314, y: 0.241309002041817, z: -0.818287014961243 },
  { x: 0.269403994083405, y: 0.635424971580505, z: -0.723640978336334 },
  { x: 0.0456760004162788, y: 0.672753989696503, z: -0.73845499753952 },
  { x: -0.180510997772217, y: 0.674656987190247, z: -0.715718984603882 },
  { x: -0.397130995988846, y: 0.636640012264252, z: -0.661041975021362 },
  { x: -0.552003979682922, y: 0.472514986991882, z: -0.687038004398346 },
  { x: -0.772170007228851, y: 0.0830899998545647, z: -0.629960000514984 },
  { x: -0.669818997383118, y: -0.119533002376556, z: -0.732840001583099 },
  { x: -0.540454983711243, y: -0.318444013595581, z: -0.77878201007843 },
  { x: -0.386135011911392, y: -0.522789001464844, z: -0.759993970394135 },
  { x: -0.26146599650383, y: -0.688566982746124, z: -0.676394999027252 },
  { x: -0.0194119997322559, y: -0.696102976799011, z: -0.717679977416992 },
  { x: 0.303568989038467, y: -0.481844007968903, z: -0.821992993354797 },
  { x: 0.681939005851746, y: -0.195129007101059, z: -0.704900026321411 },
  { x: -0.244889006018639, y: -0.116562001407146, z: -0.962518990039825 },
  { x: 0.800759017467499, y: -0.0229790005832911, z: -0.598546028137207 },
  { x: -0.370274990797043, y: 0.0955839976668358, z: -0.923991024494171 },
  { x: -0.330671012401581, y: -0.326577991247177, z: -0.885439991950989 },
  { x: -0.163220003247261, y: -0.527579009532928, z: -0.833679020404816 },
  { x: 0.126389995217323, y: -0.313145995140076, z: -0.941256999969482 },
  { x: 0.349548012018204, y: -0.272226005792618, z: -0.896498024463654 },
  { x: 0.239917993545532, y: -0.0858250036835671, z: -0.966992020606995 },
  { x: 0.390845000743866, y: 0.0815370008349419, z: -0.916837990283966 },
  { x: 0.2552669942379, y: 0.268696993589401, z: -0.928785026073456 },
  { x: 0.146245002746582, y: 0.480437994003296, z: -0.864749014377594 },
  { x: -0.326016008853912, y: 0.478455990552902, z: -0.815348982810974 },
  { x: -0.46968200802803, y: -0.112519003450871, z: -0.875635981559753 },
  { x: 0.818440020084381, y: -0.258520007133484, z: -0.513150990009308 },
  { x: -0.474317997694015, y: 0.292237997055054, z: -0.830433011054993 },
  { x: 0.778943002223969, y: 0.395841985940933, z: -0.486371010541916 },
  { x: 0.624094009399414, y: 0.39377298951149, z: -0.674870014190674 },
  { x: 0.740885972976685, y: 0.203833997249603, z: -0.639953017234802 },
  { x: 0.480217009782791, y: 0.565768003463745, z: -0.670297026634216 },
  { x: 0.380930006504059, y: 0.424535006284714, z: -0.821377992630005 },
  { x: -0.0934220030903816, y: 0.501124024391174, z: -0.860318005084991 },
  { x: -0.236485004425049, y: 0.296198010444641, z: -0.925387024879456 },
  { x: -0.131531000137329, y: 0.0939590036869049, z: -0.986849009990692 },
  { x: -0.823562026023865, y: 0.29577699303627, z: -0.484005987644196 },
  { x: 0.611065983772278, y: -0.624303996562958, z: -0.486663997173309 },
  { x: 0.0694959983229637, y: -0.520330011844635, z: -0.851132988929748 },
  { x: 0.226521998643875, y: -0.664879024028778, z: -0.711775004863739 },
  { x: 0.471307992935181, y: -0.568903982639313, z: -0.673956990242004 },
  { x: 0.38842499256134, y: -0.74262398481369, z: -0.545560002326965 },
  { x: 0.783675014972687, y: -0.480729013681412, z: -0.393384993076324 },
  { x: 0.962393999099731, y: 0.135675996541977, z: -0.235348999500275 },
  { x: 0.876607000827789, y: 0.172033995389938, z: -0.449405997991562 },
  { x: 0.633405029773712, y: 0.589793026447296, z: -0.500940978527069 },
  { x: 0.182275995612144, y: 0.800657987594605, z: -0.570720970630646 },
  { x: 0.177002996206284, y: 0.764133989810944, z: 0.620297014713287 },
  { x: -0.544016003608704, y: 0.675514996051788, z: -0.497720986604691 },
  { x: -0.679296970367432, y: 0.286466985940933, z: -0.675642013549805 },
  { x: -0.590390980243683, y: 0.0913690030574799, z: -0.801928997039795 },
  { x: -0.824360013008118, y: -0.133123993873596, z: -0.550189018249512 },
  { x: -0.715794026851654, y: -0.334542006254196, z: -0.612960994243622 },
  { x: 0.174285992980003, y: -0.8924840092659, z: 0.416049003601074 },
  { x: -0.0825280025601387, y: -0.837122976779938, z: -0.54075300693512 },
  { x: 0.283331006765366, y: -0.88087397813797, z: -0.379189014434814 },
  { x: 0.675134003162384, y: -0.42662701010704, z: -0.601817011833191 },
  { x: 0.843720018863678, y: -0.512335002422333, z: -0.16015599668026 },
  { x: 0.977303981781006, y: -0.0985559970140457, z: -0.187519997358322 },
  { x: 0.84629499912262, y: 0.52267199754715, z: -0.102946996688843 },
  { x: 0.677141010761261, y: 0.721324980258942, z: -0.145501002669334 },
  { x: 0.320964992046356, y: 0.870891988277435, z: -0.372193992137909 },
  { x: -0.178977996110916, y: 0.911532998085022, z: -0.37023600935936 },
  { x: -0.447169005870819, y: 0.826700985431671, z: -0.341473996639252 },
  { x: -0.703203022480011, y: 0.496327996253967, z: -0.50908100605011 },
  { x: -0.977181017398834, y: 0.0635629966855049, z: -0.202674001455307 },
  { x: -0.878170013427734, y: -0.412937998771667, z: 0.241455003619194 },
  { x: -0.835830986499786, y: -0.358550012111664, z: -0.415728002786636 },
  { x: -0.499173998832703, y: -0.693432986736298, z: -0.519591987133026 },
  { x: -0.188788995146751, y: -0.923753023147583, z: -0.333225011825562 },
  { x: 0.19225400686264, y: -0.969361007213593, z: -0.152896001935005 },
  { x: 0.515940010547638, y: -0.783906996250153, z: -0.345391988754272 },
  { x: 0.90592497587204, y: -0.300951987504959, z: -0.297870993614197 },
  { x: 0.991111993789673, y: -0.127746000885963, z: 0.0371069982647896 },
  { x: 0.995135009288788, y: 0.0984240025281906, z: -0.0043830000795424 },
  { x: 0.760123014450073, y: 0.646277010440826, z: 0.0673670023679733 },
  { x: 0.205220997333527, y: 0.95958000421524, z: -0.192590996623039 },
  { x: -0.0427500009536743, y: 0.979512989521027, z: -0.196790993213654 },
  { x: -0.438017010688782, y: 0.898926973342895, z: 0.00849200040102005 },
  { x: -0.821994006633759, y: 0.480785012245178, z: -0.305238991975784 },
  { x: -0.899917006492615, y: 0.0817100033164024, z: -0.428337007761002 },
  { x: -0.926612019538879, y: -0.144618004560471, z: -0.347095996141434 },
  { x: -0.79365998506546, y: -0.557792007923126, z: -0.242838993668556 },
  { x: -0.431349992752075, y: -0.847778975963593, z: -0.308557987213135 },
  { x: -0.00549199990928173, y: -0.964999973773956, z: 0.262192994356155 },
  { x: 0.587904989719391, y: -0.804026007652283, z: -0.0889400020241737 },
  { x: 0.699492990970612, y: -0.667685985565186, z: -0.254765003919601 },
  { x: 0.889303028583527, y: 0.35979500412941, z: -0.282290995121002 },
  { x: 0.780972003936768, y: 0.197036996483803, z: 0.592671990394592 },
  { x: 0.520120978355408, y: 0.506695985794067, z: 0.687556982040405 },
  { x: 0.403894990682602, y: 0.693961024284363, z: 0.59605997800827 },
  { x: -0.154982998967171, y: 0.899236023426056, z: 0.409090012311935 },
  { x: -0.65733802318573, y: 0.537168025970459, z: 0.528542995452881 },
  { x: -0.746195018291473, y: 0.334091007709503, z: 0.57582700252533 },
  { x: -0.624952018260956, y: -0.0491439998149872, z: 0.77911502122879 },
  { x: 0.318141013383865, y: -0.254714995622635, z: 0.913185000419617 },
  { x: -0.555896997451782, y: 0.405294001102447, z: 0.725751996040344 },
  { x: -0.794434010982513, y: 0.0994059965014458, z: 0.599160015583038 },
  { x: -0.64036101102829, y: -0.689463019371033, z: 0.3384949862957 },
  { x: -0.126712992787361, y: -0.734094977378845, z: 0.667119979858398 },
  { x: 0.105457000434399, y: -0.780816972255707, z: 0.615795016288757 },
  { x: 0.407992988824844, y: -0.480915993452072, z: 0.776054978370666 },
  { x: 0.69513601064682, y: -0.545120000839233, z: 0.468647003173828 },
  { x: 0.973191022872925, y: -0.00648899981752038, z: 0.229908004403114 },
  { x: 0.946893990039825, y: 0.31750899553299, z: -0.0507990010082722 },
  { x: 0.563583016395569, y: 0.825612008571625, z: 0.0271829999983311 },
  { x: 0.325773000717163, y: 0.945423007011414, z: 0.00694900006055832 },
  { x: -0.171820998191834, y: 0.985096991062164, z: -0.00781499966979027 },
  { x: -0.670440971851349, y: 0.739938974380493, z: 0.0547689981758594 },
  { x: -0.822980999946594, y: 0.554961979389191, z: 0.121321998536587 },
  { x: -0.96619302034378, y: 0.117857001721859, z: 0.229306995868683 },
  { x: -0.953769028186798, y: -0.294703990221024, z: 0.0589450001716614 },
  { x: -0.864386975765228, y: -0.50272798538208, z: -0.0100149996578693 },
  { x: -0.530609011650085, y: -0.842006027698517, z: -0.0973659977316856 },
  { x: -0.16261799633503, y: -0.984075009822845, z: 0.071772001683712 },
  { x: 0.081446997821331, y: -0.996011018753052, z: 0.0364390015602112 },
  { x: 0.745984017848968, y: -0.665962994098663, z: 0.000761999981477857 },
  { x: 0.942057013511658, y: -0.329268991947174, z: -0.0641060024499893 },
  { x: 0.939701974391937, y: -0.2810899913311, z: 0.19480299949646 },
  { x: 0.771214008331299, y: 0.550670027732849, z: 0.319362998008728 },
  { x: 0.641348004341126, y: 0.730690002441406, z: 0.234020993113518 },
  { x: 0.0806820020079613, y: 0.996690988540649, z: 0.00987899955362082 },
  { x: -0.0467250011861324, y: 0.976643025875092, z: 0.209725007414818 },
  { x: -0.531076014041901, y: 0.821000993251801, z: 0.209562003612518 },
  { x: -0.695815026760101, y: 0.65599000453949, z: 0.292434990406036 },
  { x: -0.97612202167511, y: 0.21670900285244, z: -0.0149130001664162 },
  { x: -0.961660981178284, y: -0.144128993153572, z: 0.233313992619514 },
  { x: -0.77208399772644, y: -0.613646984100342, z: 0.165298998355865 },
  { x: -0.449600011110306, y: -0.836059987545013, z: 0.314426004886627 },
  { x: -0.392699986696243, y: -0.914615988731384, z: 0.0962470024824142 },
  { x: 0.390588998794556, y: -0.919470012187958, z: 0.0448900014162064 },
  { x: 0.582529008388519, y: -0.799197971820831, z: 0.148127004504204 },
  { x: 0.866430997848511, y: -0.489811986684799, z: 0.0968639999628067 },
  { x: 0.904586970806122, y: 0.11149799823761, z: 0.411449998617172 },
  { x: 0.953536987304687, y: 0.232329994440079, z: 0.191806003451347 },
  { x: 0.497310996055603, y: 0.770802974700928, z: 0.398176997900009 },
  { x: 0.194066002964973, y: 0.956319987773895, z: 0.218611001968384 },
  { x: 0.422876000404358, y: 0.882275998592377, z: 0.206797003746033 },
  { x: -0.373796999454498, y: 0.849565982818604, z: 0.372173994779587 },
  { x: -0.534497022628784, y: 0.714022994041443, z: 0.452199995517731 },
  { x: -0.881826996803284, y: 0.237159997224808, z: 0.407597988843918 },
  { x: -0.904947996139526, y: -0.0140690002590418, z: 0.425289005041122 },
  { x: -0.751827001571655, y: -0.512817025184631, z: 0.414458006620407 },
  { x: -0.50101500749588, y: -0.697916984558105, z: 0.511758029460907 },
  { x: -0.235190004110336, y: -0.925922989845276, z: 0.295554995536804 },
  { x: 0.228982999920845, y: -0.953939974308014, z: 0.193819001317024 },
  { x: 0.734025001525879, y: -0.634898006916046, z: 0.241062000393867 },
  { x: 0.913752973079681, y: -0.0632530003786087, z: -0.401315987110138 },
  { x: 0.905735015869141, y: -0.161486998200417, z: 0.391874998807907 },
  { x: 0.858929991722107, y: 0.342445999383926, z: 0.380748987197876 },
  { x: 0.624486029148102, y: 0.60758101940155, z: 0.490776985883713 },
  { x: 0.289263993501663, y: 0.857478976249695, z: 0.425507992506027 },
  { x: 0.0699680000543594, y: 0.902168989181519, z: 0.425671011209488 },
  { x: -0.28617998957634, y: 0.940699994564056, z: 0.182164996862411 },
  { x: -0.574012994766235, y: 0.805118978023529, z: -0.149308994412422 },
  { x: 0.111258000135422, y: 0.0997179970145225, z: -0.988776028156281 },
  { x: -0.305393010377884, y: -0.944227993488312, z: -0.123159997165203 },
  { x: -0.601166009902954, y: -0.78957599401474, z: 0.123162999749184 },
  { x: -0.290645003318787, y: -0.812139987945557, z: 0.505918979644775 },
  { x: -0.064920000731945, y: -0.877162992954254, z: 0.475784987211227 },
  { x: 0.408300995826721, y: -0.862215995788574, z: 0.299789011478424 },
  { x: 0.566097021102905, y: -0.725566029548645, z: 0.391263991594315 },
  { x: 0.839363992214203, y: -0.427386999130249, z: 0.335869014263153 },
  { x: 0.818899989128113, y: -0.0413050018250942, z: 0.572448015213013 },
  { x: 0.719784021377564, y: 0.414997011423111, z: 0.556496977806091 },
  { x: 0.881744027137756, y: 0.450269997119904, z: 0.140659004449844 },
  { x: 0.40182301402092, y: -0.898220002651215, z: -0.178151994943619 },
  { x: -0.0540199987590313, y: 0.791343986988068, z: 0.608980000019074 },
  { x: -0.293774008750916, y: 0.763993978500366, z: 0.574464976787567 },
  { x: -0.450798004865646, y: 0.610346972942352, z: 0.651350975036621 },
  { x: -0.638221025466919, y: 0.186693996191025, z: 0.746873021125793 },
  { x: -0.872870028018951, y: -0.257126986980438, z: 0.414707988500595 },
  { x: -0.587257027626038, y: -0.521709978580475, z: 0.618827998638153 },
  { x: -0.353657990694046, y: -0.641973972320557, z: 0.680290997028351 },
  { x: 0.0416489988565445, y: -0.611272990703583, z: 0.79032301902771 },
  { x: 0.348342001438141, y: -0.779182970523834, z: 0.521086990833282 },
  { x: 0.499166995286942, y: -0.622440993785858, z: 0.602825999259949 },
  { x: 0.790018975734711, y: -0.3038310110569, z: 0.53250002861023 },
  { x: 0.660117983818054, y: 0.0607330016791821, z: 0.748701989650726 },
  { x: 0.604920983314514, y: 0.29416099190712, z: 0.739960014820099 },
  { x: 0.38569700717926, y: 0.379346013069153, z: 0.841032028198242 },
  { x: 0.239693000912666, y: 0.207875996828079, z: 0.948332011699677 },
  { x: 0.012622999958694, y: 0.258531987667084, z: 0.965919971466065 },
  { x: -0.100556999444962, y: 0.457147002220154, z: 0.883687973022461 },
  { x: 0.0469669997692108, y: 0.628588020801544, z: 0.776319026947021 },
  { x: -0.430391013622284, y: -0.445405006408691, z: 0.785097002983093 },
  { x: -0.434291005134583, y: -0.196227997541428, z: 0.879139006137848 },
  { x: -0.256637006998062, y: -0.33686700463295, z: 0.905902028083801 },
  { x: -0.131372004747391, y: -0.158910006284714, z: 0.978514015674591 },
  { x: 0.102379001677036, y: -0.208766996860504, z: 0.972591996192932 },
  { x: 0.195686995983124, y: -0.450129002332687, z: 0.871258020401001 },
  { x: 0.627318978309631, y: -0.42314800620079, z: 0.653770983219147 },
  { x: 0.687439024448395, y: -0.171582996845245, z: 0.70568197965622 },
  { x: 0.275920003652573, y: -0.021254999563098, z: 0.960946023464203 },
  { x: 0.459367007017136, y: 0.157465994358063, z: 0.874177992343903 },
  { x: 0.285394996404648, y: 0.583184003829956, z: 0.760555982589722 },
  { x: -0.812174022197723, y: 0.460303008556366, z: 0.358460992574692 },
  { x: -0.189068004488945, y: 0.641223013401032, z: 0.743698000907898 },
  { x: -0.338874995708466, y: 0.476480007171631, z: 0.811251997947693 },
  { x: -0.920993983745575, y: 0.347185999155045, z: 0.176726996898651 },
  { x: 0.0406389981508255, y: 0.024465000256896, z: 0.998874008655548 },
  { x: -0.739131987094879, y: -0.353747010231018, z: 0.573189973831177 },
  { x: -0.603511989116669, y: -0.286615014076233, z: 0.744059979915619 },
  { x: -0.188675999641418, y: -0.547058999538422, z: 0.815554022789001 },
  { x: -0.0260450001806021, y: -0.397819995880127, z: 0.917093992233276 },
  { x: 0.267897009849548, y: -0.649040997028351, z: 0.712023019790649 },
  { x: 0.518245995044708, y: -0.28489100933075, z: 0.806385993957519 },
  { x: 0.493450999259949, y: -0.0665329992771149, z: 0.867224991321564 },
  { x: -0.328188002109528, y: 0.140250995755196, z: 0.934143006801605 },
  { x: -0.328188002109528, y: 0.140250995755196, z: 0.934143006801605 },
  { x: -0.328188002109528, y: 0.140250995755196, z: 0.934143006801605 },
  { x: -0.328188002109528, y: 0.140250995755196, z: 0.934143006801605 },
];

const getValue = (dataView: DataView) => (type: ValueType) => {
  const getterMap = {
    [ValueType.Uint8]: (byteOffset: number) => dataView.getUint8(byteOffset),
    [ValueType.Int8]: (byteOffset: number) => dataView.getInt8(byteOffset),
    [ValueType.Uint16]: (byteOffset: number) =>
      dataView.getUint16(byteOffset, LITTLE_ENDIAN),
    [ValueType.Int16]: (byteOffset: number) =>
      dataView.getInt16(byteOffset, LITTLE_ENDIAN),
    [ValueType.Uint32]: (byteOffset: number) =>
      dataView.getUint32(byteOffset, LITTLE_ENDIAN),
    [ValueType.Int32]: (byteOffset: number) =>
      dataView.getInt32(byteOffset, LITTLE_ENDIAN),
    [ValueType.Float32]: (byteOffset: number) =>
      dataView.getFloat32(byteOffset, LITTLE_ENDIAN),
  };

  return getterMap[type];
};

function bufferToString(array: Uint8Array) {
  const utf8Decoder = new TextDecoder();

  const zeroIndex = array.findIndex((value) => value === 0);

  return utf8Decoder.decode(
    array.slice(0, zeroIndex !== -1 ? zeroIndex : array.length)
  );
}

function getTypeSize(value: ValueType | DataDescription[]) {
  if (Array.isArray(value)) {
    return value.reduce<number>(
      (sum, value) => (sum += getTypeSize(value.type) * (value.length || 1)),
      0
    );
  }

  return BYTE_SIZES[value];
}

function parse<T extends { [key: string]: unknown }>(
  buffer: ArrayBuffer,
  dataDescription: DataDescription[],
  byteOffset = 0
) {
  const dataView = new DataView(buffer, byteOffset);
  const getDataValue = getValue(dataView);

  const data = dataDescription.reduce((struct, value, index, data) => {
    const label = value.label || `unknown_${index}`;
    const localByteOffset = data
      .slice(0, index)
      .reduce(
        (sum, value) => (sum += getTypeSize(value.type) * (value.length || 1)),
        0
      );

    if (value.length) {
      if (value.string) {
        const array = new Uint8Array(
          buffer.slice(byteOffset + localByteOffset, byteOffset + value.length)
        );
        struct[label] = bufferToString(array);
      } else {
        const array = [];
        const size = getTypeSize(value.type);
        for (let i = 0; i < value.length; i++) {
          if (!Array.isArray(value.type)) {
            array.push(getDataValue(value.type)(localByteOffset + i * size));
          } else {
            array.push(
              parse(
                buffer,
                value.type,
                byteOffset + localByteOffset + i * getTypeSize(value.type)
              )
            );
          }
        }
        struct[label] = array;
      }
    } else if (!Array.isArray(value.type)) {
      struct[label] = getDataValue(value.type)(localByteOffset);
    } else {
      struct[label] = parse(buffer, value.type, byteOffset + localByteOffset);
    }

    return struct;
  }, {});

  return data as T;
}

type MainHeader = {
  fileType: string;
  numSections: number;
  numberSectionsBis: number;
  bodySize: number;
  startPaletteRemap: number;
  endPaletteRemap: number;
  palette: number[];
};

function parseMainHeader(buffer: ArrayBuffer) {
  const headerStructure: DataDescription[] = [
    { label: "fileType", type: ValueType.Uint8, length: 16, string: true },
    { type: ValueType.Uint32 },
    { label: "numSections", type: ValueType.Uint32 },
    { label: "numSectionsBis", type: ValueType.Uint32 },
    { label: "bodySize", type: ValueType.Uint32 },
    { label: "startPaletteRemap", type: ValueType.Uint8 },
    { label: "endPaletteRemap", type: ValueType.Uint8 },
    { label: "palette", type: ValueType.Uint8, length: 256 * 3 },
  ];

  return parse<MainHeader>(buffer, headerStructure);
}

function parseSectionBody(
  buffer: ArrayBuffer,
  tailer: SectionTailer,
  byteOffset: number
) {
  const voxels: Array<{
    position: Vector3;
    colour: number;
    normal: number;
  }> = [];
  const baseOffset =
    MAIN_HEADER_SIZE_BYTE + byteOffset + tailer.spanStartOffset;

  const nSpans = tailer.width * tailer.depth;

  const spansAddressesStructure: DataDescription[] = [
    {
      label: "spanStart",
      type: ValueType.Int32,
      length: nSpans,
    },
    {
      label: "spanEnd",
      type: ValueType.Int32,
      length: nSpans,
    },
  ];

  const spansAddresses = parse<{
    spanStart: number[];
    spanEnd: number[];
  }>(buffer, spansAddressesStructure, baseOffset);

  let offset = baseOffset + getTypeSize(spansAddressesStructure);
  const origOffset = offset;

  const dataView = new DataView(buffer);
  for (let i = 0; i < nSpans; i++) {
    if (
      spansAddresses.spanStart[i] === -1 ||
      spansAddresses.spanEnd[i] === -1
    ) {
      continue;
    }

    offset = origOffset + spansAddresses.spanStart[i];

    let y = 0;
    while (y < tailer.height) {
      const skip = dataView.getUint8(offset);

      offset += 1;
      y += skip;

      if (y >= tailer.height) break;

      const numVoxels = dataView.getUint8(offset);
      offset += 1;

      const voxelDataStructure = [
        {
          label: "data",
          length: numVoxels,
          type: [
            { label: "colour", type: ValueType.Uint8 },
            { label: "normal", type: ValueType.Uint8 },
          ],
        },
        { label: "numVoxels", type: ValueType.Uint8 },
      ];
      const data = parse<{
        data: Array<{ colour: number; normal: number }>;
        numVoxels: number;
      }>(buffer, voxelDataStructure, offset);

      data.data.forEach((voxel, index) =>
        voxels.push({
          position: {
            x: i % tailer.width,
            y: y + index,
            z: Math.floor(i / tailer.width),
          },
          colour: voxel.colour,
          normal: voxel.normal,
        })
      );

      if (numVoxels !== data.numVoxels) {
        throw Error(
          `${offset} (${offset.toString(16)}): ${numVoxels} != ${
            data.numVoxels
          }`
        );
      }

      y += numVoxels;
      offset += getTypeSize(voxelDataStructure);
    }

    offset += 2; // Unknown 2 bytes
  }

  return voxels;
}

type SectionTailer = {
  spanStartOffset: number;
  spanEndOffset: number;
  spanDataOffset: number;
  scale: number;
  transformMatrix: Matrix;
  minBound: number[];
  maxBound: number[];
  width: number;
  height: number;
  depth: number;
  normalType: number;
};

function parseSectionTailers(
  buffer: ArrayBuffer,
  count: number,
  bodySize: number
) {
  const tailersStructure: DataDescription[] = [
    {
      label: "tailers",
      length: count,
      type: [
        { label: "spanStartOffset", type: ValueType.Uint32 },
        { label: "spanEndOffset", type: ValueType.Uint32 },
        { label: "spanDataOffset", type: ValueType.Uint32 },
        { label: "scale", type: ValueType.Float32 },
        { label: "transformMatrix", type: ValueType.Float32, length: 12 },
        { label: "minBound", type: ValueType.Float32, length: 3 },
        { label: "maxBound", type: ValueType.Float32, length: 3 },
        { label: "width", type: ValueType.Uint8 },
        { label: "depth", type: ValueType.Uint8 },
        { label: "height", type: ValueType.Uint8 },
        {
          label: "normalType",
          type: ValueType.Uint8,
        } /* 2 == TS Normals, 4 == RA2 Normals */,
      ],
    },
  ];

  const parsed = parse<{
    tailers: SectionTailer[];
  }>(
    buffer,
    tailersStructure,
    MAIN_HEADER_SIZE_BYTE + count * SECTION_HEADER_SIZE_BYTE + bodySize
  );

  return parsed.tailers;
}

function parseSections(buffer: ArrayBuffer, tailers: SectionTailer[]) {
  return tailers.map((tailer, index) => {
    const voxels = parseSectionBody(
      buffer,
      tailer,
      tailers.length * SECTION_HEADER_SIZE_BYTE
    );
    const data = new Uint8Array(voxels.length * 5);
    voxels.forEach((voxel, i) => {
      if (voxel) {
        const i5 = i * 5;
        data[i5 + 0] = voxel.position.x;
        data[i5 + 1] = voxel.position.y;
        data[i5 + 2] = voxel.position.z;
        data[i5 + 3] = voxel.colour;
        data[i5 + 4] = voxel.normal;
      }
    });

    return {
      data,
      size: {
        x: tailer.width,
        y: tailer.height,
        z: tailer.depth,
      },
      scale: tailer.scale,
      minBounds: {
        x: tailer.minBound[0],
        y: tailer.minBound[2], // Inverse Y and Z
        z: tailer.minBound[1],
      },
      maxBounds: {
        x: tailer.maxBound[0],
        y: tailer.maxBound[2], // Inverse Y and Z
        z: tailer.maxBound[1],
      },
      normalPalette: tailer.normalType === 4 ? RA2_NORMALS : TS_NORMALS,
      transformMatrix: [
        tailer.transformMatrix[0],
        tailer.transformMatrix[1] * tailer.scale,
        tailer.transformMatrix[2] * tailer.scale,
        tailer.transformMatrix[3] * tailer.scale,

        tailer.transformMatrix[4] * tailer.scale,
        tailer.transformMatrix[5],
        tailer.transformMatrix[6] * tailer.scale,
        tailer.transformMatrix[11] * tailer.scale, // Inverse Y and Z

        tailer.transformMatrix[8] * tailer.scale,
        tailer.transformMatrix[9] * tailer.scale,
        tailer.transformMatrix[10],
        tailer.transformMatrix[7] * tailer.scale, // Inverse Y and Z
      ] as Matrix,
    };
  });
}

type Section = {
  data: Uint8Array;
  size: Vector3;
  scale: number;
  minBounds: Vector3;
  maxBounds: Vector3;
  normalPalette: Vector3[];
  transformMatrix: Matrix;
};

export class VXLLoader extends Loader {
  load(
    url: string,
    onLoad: (data: ReturnType<VXLLoader["parse"]>) => void,
    onProgress?: () => void,
    onError?: (errorEvent: ErrorEvent) => void
  ) {
    const scope = this;

    const loader = new FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setResponseType("arraybuffer");
    loader.setRequestHeader(scope.requestHeader);
    loader.load(
      url,
      (buffer) => {
        try {
          onLoad(scope.parse(buffer as ArrayBuffer));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }

  parse(buffer: ArrayBuffer) {
    const mainHeader = parseMainHeader(buffer);
    const sectionTailers = parseSectionTailers(
      buffer,
      mainHeader.numSections,
      mainHeader.bodySize
    );

    const palette: Color[] = [];
    for (let i = 0; i < mainHeader.palette.length; i += 3)
      palette.push({
        r: mainHeader.palette[i + 0],
        g: mainHeader.palette[i + 1],
        b: mainHeader.palette[i + 2],
      });

    return {
      palette,
      paletteRemap: {
        start: mainHeader.startPaletteRemap,
        end: mainHeader.endPaletteRemap,
      },
      sections: parseSections(buffer, sectionTailers),
    };
  }
}
