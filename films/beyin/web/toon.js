export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
const SH_SKIN = [
    0.96,
    0.86,
    0.84
];
const SH_CLOTH = [
    0.64,
    0.66,
    0.74
];
const SH_FELT = [
    0.62,
    0.62,
    0.7
];
const rad = (d)=>d * Math.PI / 180;
const clamp = (x, a, b)=>Math.max(a, Math.min(b, x));
export const mul = (c, m)=>{
    const n = parseInt(c.slice(1), 16);
    const ch = (v, k)=>Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
    return `#${ch(n >> 16 & 255, m[0])}${ch(n >> 8 & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c, k)=>mul(c, [
        k,
        k,
        k
    ]);
export const mix = (a, b, t)=>{
    const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    const ch = (s)=>Math.round((A >> s & 255) * (1 - t) + (B >> s & 255) * t).toString(16).padStart(2, "0");
    return `#${ch(16)}${ch(8)}${ch(0)}`;
};
const rnd = (seed, k)=>{
    const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
};
const rotPts = (pts, a, cx, cy)=>pts.map(([x, y])=>[
            cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a),
            cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)
        ]);
const rotAbout = (q, a, c)=>rotPts([
        q
    ], a, c[0], c[1])[0];
const lerp2 = (a, b, t)=>[
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t
    ];
const curve = (a, k, b, n = 10)=>{
    const c = [
        2 * k[0] - (a[0] + b[0]) / 2,
        2 * k[1] - (a[1] + b[1]) / 2
    ], out = [];
    for(let i = 0; i <= n; i++){
        const t = i / n, s = 1 - t;
        out.push([
            s * s * a[0] + 2 * s * t * c[0] + t * t * b[0],
            s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]
        ]);
    }
    return out;
};
export const RIFLEMAN = {
    jacket: "#357650",
    pants: "#3d4440",
    boots: INK,
    hat: "shako",
    belt: "#f1efe6",
    buttons: "#d9dde0",
    rifle: true
};
export const OFFICER = {
    ...RIFLEMAN,
    hat: "shako_tall",
    buttons: "#e8c45a",
    sash: "#c0353a",
    sword: true,
    moustache: "#4a3020",
    rifle: false,
    belt: null,
    build: "stout"
};
export const KID = {
    jacket: "#f08a2c",
    pants: "#3b5b9a",
    boots: "#f4f1ea",
    hat: "cap",
    cap: "#e2453c",
    build: "kid"
};
export const PARENT = {
    jacket: "#7b5ac9",
    pants: "#3b3f52",
    boots: "#5a3b2a",
    hat: "hair",
    hair: "#5a3b2a"
};
export const SKINS = [
    SKIN,
    "#f5c9a0",
    "#ecd0b6",
    "#c99067"
];
export const soldier = (v = 0, extra = {})=>{
    const o = {
        ...RIFLEMAN,
        skin: SKINS[v % 4]
    };
    if (v % 4 === 1) o.moustache = "#4a3426";
    if (v % 4 === 3) o.moustache = "#2a201a";
    return {
        ...o,
        ...extra
    };
};
export const townsfolk = (v = 0)=>{
    const coats = [
        "#3f6fb5",
        "#8c3b4a",
        "#5d7a3a",
        "#b5653f",
        "#2f5f6a",
        "#7b5ac9"
    ];
    const o = {
        jacket: coats[v % 6],
        pants: "#3b3f52",
        boots: "#4a3426",
        skin: SKINS[v % 4]
    };
    return v % 2 ? {
        ...o,
        hat: "bonnet",
        dress: [
            "#d9a441",
            "#c25a7a",
            "#5a8fc2"
        ][v % 3]
    } : {
        ...o,
        hat: "tophat"
    };
};
export class Pen {
    g;
    ol = 12;
    rot = null;
    constructor(g){
        this.g = g;
    }
    P(x, y) {
        if (!this.rot) return [
            x,
            y
        ];
        const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
        return [
            cx + (x - cx) * c - (y - cy) * s + dx,
            cy + (x - cx) * s + (y - cy) * c + dy
        ];
    }
    path(pts, close) {
        const g = this.g;
        g.beginPath();
        pts.forEach((p, i)=>{
            const [x, y] = this.P(p[0], p[1]);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
        });
        if (close) g.closePath();
    }
    poly(pts, fill, ol) {
        const g = this.g, w = ol ?? this.ol;
        this.path(pts, true);
        if (fill) {
            g.fillStyle = fill;
            g.fill();
        }
        if (w) {
            g.lineWidth = w;
            g.strokeStyle = INK;
            g.lineJoin = "round";
            g.stroke();
        }
    }
    ell(cx, cy, rx, ry, fill, ol, a0 = 0, a1 = 360, rot = 0) {
        this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
    }
    line(pts, fill, w, ink = true) {
        const g = this.g;
        g.lineCap = "round";
        g.lineJoin = "round";
        if (ink) {
            this.path(pts, false);
            g.strokeStyle = INK;
            g.lineWidth = w + 2 * this.ol * 0.9;
            g.stroke();
        }
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
    }
    stroke(pts, w, fill = INK) {
        const g = this.g;
        g.lineCap = "round";
        g.lineJoin = "round";
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
    }
    arc(cx, cy, rx, ry, a0, a1, w, fill = INK) {
        const pts = [];
        for(let i = 0; i <= 24; i++)pts.push([
            cx + rx * Math.cos(rad(a0 + (a1 - a0) * i / 24)),
            cy + ry * Math.sin(rad(a0 + (a1 - a0) * i / 24))
        ]);
        this.stroke(pts, w, fill);
    }
    dot(cx, cy, r, fill = INK) {
        const [x, y] = this.P(cx, cy);
        this.g.beginPath();
        this.g.arc(x, y, r, 0, Math.PI * 2);
        this.g.fillStyle = fill;
        this.g.fill();
    }
    clip(pts, fn) {
        const g = this.g;
        g.save();
        this.path(pts, true);
        g.clip();
        fn();
        g.restore();
    }
    shadedFill(pts, base, shadow, light, R, shift = 0.45, r0 = 1.05, r1 = 1.25) {
        const g = this.g, n = pts.length;
        let cx = 0, cy = 0;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
        }
        const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
        const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
        gr.addColorStop(0, base);
        gr.addColorStop(r0 / r1, base);
        gr.addColorStop(1, shadow);
        this.path(pts, true);
        g.fillStyle = gr;
        g.fill();
    }
    gradFill(pts, base, shadow, light, flat = 0.22) {
        const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
        let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
            const d = x * dx + y * dy;
            lo = Math.min(lo, d);
            hi = Math.max(hi, d);
        }
        const dc = cx * dx + cy * dy;
        const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
        const gr = g.createLinearGradient(ax, ay, bx, by);
        gr.addColorStop(0, base);
        gr.addColorStop(flat, base);
        gr.addColorStop(1, shadow);
        this.path(pts, true);
        g.fillStyle = gr;
        g.fill();
    }
    inkRing(pts, w0, thick, k = 0.45, col = INK) {
        const n = pts.length;
        let cx = 0, cy = 0;
        for (const [x, y] of pts){
            cx += x / n;
            cy += y / n;
        }
        const out = [], inn = [];
        pts.forEach((q, i)=>{
            const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
            let nx = b[1] - a[1], ny = a[0] - b[0];
            const l = Math.hypot(nx, ny) || 1;
            nx /= l;
            ny /= l;
            const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
            out.push([
                q[0] + nx * h,
                q[1] + ny * h
            ]);
            inn.push([
                q[0] - nx * h,
                q[1] - ny * h
            ]);
        });
        const g = this.g;
        const trace = (r)=>{
            r.forEach(([x0, y0], i)=>{
                const [x, y] = this.P(x0, y0);
                if (i) g.lineTo(x, y);
                else g.moveTo(x, y);
            });
            g.closePath();
        };
        g.beginPath();
        trace(out);
        trace(inn.reverse());
        g.fillStyle = col;
        g.fill("evenodd");
    }
    band(pts, fill, w, rim, cap = "butt") {
        const g = this.g;
        g.lineCap = cap;
        g.lineJoin = "round";
        this.path(pts, false);
        g.strokeStyle = INK;
        g.lineWidth = w + 2 * rim;
        g.stroke();
        this.path(pts, false);
        g.strokeStyle = fill;
        g.lineWidth = w;
        g.stroke();
        g.lineCap = "round";
    }
}
const ellPts = (cx, cy, rx, ry, a0 = 0, a1 = 360, rot = 0, n = 48)=>{
    const r = rad(rot), pts = [];
    for(let i = 0; i <= n; i++){
        const a = rad(a0 + (a1 - a0) * i / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
        pts.push([
            cx + x * Math.cos(r) - y * Math.sin(r),
            cy + x * Math.sin(r) + y * Math.cos(r)
        ]);
    }
    return pts;
};
const rrect = (x0, y0, x1, y1, r, n = 8)=>{
    const pts = [];
    for (const [cx, cy, a] of [
        [
            x1 - r,
            y0 + r,
            -90
        ],
        [
            x1 - r,
            y1 - r,
            0
        ],
        [
            x0 + r,
            y1 - r,
            90
        ],
        [
            x0 + r,
            y0 + r,
            180
        ]
    ])for(let i = 0; i <= n; i++)pts.push([
        cx + r * Math.cos(rad(a + 90 * i / n)),
        cy + r * Math.sin(rad(a + 90 * i / n))
    ]);
    return pts;
};
const taper = (p, a, b, wa, wb, col = INK)=>{
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    p.poly([
        [
            a[0] + nx * wa / 2,
            a[1] + ny * wa / 2
        ],
        [
            b[0] + nx * wb / 2,
            b[1] + ny * wb / 2
        ],
        [
            b[0] - nx * wb / 2,
            b[1] - ny * wb / 2
        ],
        [
            a[0] - nx * wa / 2,
            a[1] - ny * wa / 2
        ]
    ], col, 0);
    p.dot(a[0], a[1], wa / 2, col);
    p.dot(b[0], b[1], wb / 2, col);
};
export const blobPts = (cx, cy, B, n = 72)=>{
    const ph = [
        rnd(B.seed, 11),
        rnd(B.seed, 12),
        rnd(B.seed, 13)
    ].map((v)=>v * Math.PI * 2);
    const pts = [];
    for(let i = 0; i < n; i++){
        const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
        let X = Math.sign(c) * Math.abs(c) ** e;
        const Y = Math.sign(s) * Math.abs(s) ** e;
        X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
        const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
        const x = B.a * X * r, y = B.b * Y * r;
        pts.push([
            cx + x * Math.cos(B.rot) - y * Math.sin(B.rot),
            cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)
        ]);
    }
    return pts;
};
export const headBlob = (seed, a = 118, facing = 0)=>({
        a,
        b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
        nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5),
        nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
        egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
        asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
        rot: rad(8 * (rnd(seed, 7) - 0.5)),
        noise: 0.008,
        seed
    });
export const thickAngle = (light)=>Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);
const FACE = {
    neutral: {
        eye: [
            "lid",
            "lid"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "dash"
    },
    stern: {
        eye: [
            "lid",
            "lid"
        ],
        brow: [
            3,
            -2
        ],
        mouth: "frown"
    },
    grin: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -3,
            -3
        ],
        mouth: "grin"
    },
    laugh: {
        eye: [
            "squeeze",
            "squeeze"
        ],
        brow: [
            -4,
            -4
        ],
        mouth: "laugh"
    },
    whistle: {
        eye: [
            "dash",
            "dash"
        ],
        brow: [
            -2,
            -4
        ],
        mouth: "o"
    },
    nervous: {
        eye: [
            "small",
            "small"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "wave"
    },
    shock: {
        eye: [
            "shock",
            "shock"
        ],
        brow: [
            -7,
            -6
        ],
        mouth: "O"
    },
    relief: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -2,
            1
        ],
        mouth: "smileWide"
    },
    relief_open: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            -2,
            1
        ],
        mouth: "grin"
    },
    dazed: {
        eye: [
            "spiral",
            "spiral"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "wave"
    },
    pained: {
        eye: [
            "squeeze",
            "lid"
        ],
        brow: [
            -3,
            2
        ],
        mouth: "teeth"
    },
    smile: {
        eye: [
            "dot",
            "dot"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "smirk"
    },
    smile_closed: {
        eye: [
            "happy",
            "happy"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "smile"
    },
    lick: {
        eye: [
            "dot",
            "dot"
        ],
        brow: [
            0,
            -1
        ],
        mouth: "lick"
    }
};
const halfLid = (k)=>k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k;
const eyeKind = (k, lid)=>lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b)=>b === true ? 1 : Number(b) || 0;
const eye = (p, kind, x, ey, u, side, look, skin)=>{
    const lx = x + look * 3 * u, lw = 3.8 * u;
    switch(kind){
        case "dot":
            p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0);
            break;
        case "small":
            p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0);
            break;
        case "lid":
            p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180);
            p.stroke([
                [
                    x - 9 * u,
                    ey - u
                ],
                [
                    x + 9 * u,
                    ey - u
                ]
            ], lw);
            break;
        case "slit":
            p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180);
            p.stroke([
                [
                    x - 9 * u,
                    ey
                ],
                [
                    x + 9 * u,
                    ey
                ]
            ], lw);
            break;
        case "happy":
            p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw);
            break;
        case "dash":
            p.stroke([
                [
                    x - 8.5 * u,
                    ey
                ],
                [
                    x + 8.5 * u,
                    ey
                ]
            ], lw);
            break;
        case "squeeze":
            p.stroke([
                [
                    x + 6 * u * side,
                    ey - 5 * u
                ],
                [
                    x - 6 * u * side,
                    ey
                ],
                [
                    x + 6 * u * side,
                    ey + 5 * u
                ]
            ], lw);
            break;
        case "shock":
        case "shockHalf":
            p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u);
            p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
            if (kind === "shockHalf") {
                p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360);
                p.stroke([
                    [
                        x - 11 * u,
                        ey
                    ],
                    [
                        x + 11 * u,
                        ey
                    ]
                ], 2.6 * u);
            }
            break;
        default:
            {
                const s = [];
                for(let t = 1; t < 15; t++)s.push([
                    x + Math.cos(t * 0.9) * t * 0.55 * u,
                    ey + Math.sin(t * 0.9) * t * 0.55 * u
                ]);
                p.stroke(s, 2.4 * u);
            }
    }
};
const dmouth = (p, mx, y, rx, ry, u, tongue = false)=>{
    p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
    p.clip([
        [
            mx - rx,
            y
        ],
        [
            mx + rx,
            y
        ],
        [
            mx + rx,
            y + 3 * u
        ],
        [
            mx - rx,
            y + 3 * u
        ]
    ], ()=>p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
    if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
    p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};
const mouth = (p, kind, mx, my, u, k = 1)=>{
    const mw = 4 * u;
    switch(kind){
        case "dash":
            p.stroke([
                [
                    mx - 5.5 * u * k,
                    my
                ],
                [
                    mx + 5.5 * u * k,
                    my - 0.8 * u
                ]
            ], mw);
            break;
        case "frown":
            p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw);
            break;
        case "smirk":
            p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw);
            break;
        case "smile":
            p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw);
            break;
        case "smileWide":
            p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw);
            break;
        case "grin":
            dmouth(p, mx, my - u, 12 * u * k, 8 * u, u);
            break;
        case "laugh":
            dmouth(p, mx, my, 16 * u * k, 11 * u, u, true);
            break;
        case "o":
            p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u);
            break;
        case "O":
            p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u);
            break;
        case "wave":
            {
                const s = [];
                for(let i = 0; i <= 12; i++)s.push([
                    mx - 9 * u * k + i * 1.5 * u * k,
                    my + 1.5 * u * Math.sin(i * 1.3)
                ]);
                p.stroke(s, 3 * u);
                break;
            }
        case "teeth":
            p.poly([
                [
                    mx - 12 * u * k,
                    my - 4 * u
                ],
                [
                    mx + 12 * u * k,
                    my - 4 * u
                ],
                [
                    mx + 11 * u * k,
                    my + 4 * u
                ],
                [
                    mx - 11 * u * k,
                    my + 4 * u
                ]
            ], WHITE, 3 * u);
            for (const j of [
                -1,
                0,
                1
            ])p.stroke([
                [
                    mx + j * 6 * u * k,
                    my - 4 * u
                ],
                [
                    mx + j * 6 * u * k,
                    my + 4 * u
                ]
            ], 1.5 * u);
            break;
        case "lick":
            p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw);
            p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u);
            break;
    }
};
const faceFront = (p, cx, cy, W, expr, facing, look, lid, brim, skin, moustache, stout = false)=>{
    const u = W / 100, F = FACE[expr] || FACE.neutral, fx = cx + 7 * u * facing;
    const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
    for (const side of [
        -1,
        1
    ]){
        const x = fx + side * ex;
        const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
        eye(p, kind, x, ey, u, side, look, skin);
        const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
        if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
        else taper(p, [
            x - side * 8.5 * u,
            by + dI * u
        ], [
            x + side * 8.5 * u,
            by + dO * u
        ], 5 * u, 2.5 * u);
    }
    const mx = cx + 8 * u * facing, my = cy + 20 * u;
    mouth(p, F.mouth, mx, my, u);
    if (moustache) for (const s of [
        -1,
        1
    ])taper(p, [
        mx + s * 1.5 * u,
        cy + 12.5 * u
    ], [
        mx + s * (stout ? 19 : 15) * u,
        cy + (stout ? 10.5 : 15) * u
    ], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
    if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};
const faceSide = (p, hx, hy, W, expr, lid, brim, skin, moustache, stout = false)=>{
    const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
    const kind = eyeKind(F.eye[1], lid);
    eye(p, kind, ex, ey, u, 1, 0.6, skin);
    const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
    if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [
        ex + 8 * u,
        by + dI * u
    ], [
        ex - 7 * u,
        by - u + dO * u
    ], 5 * u, 2.5 * u);
    p.stroke([
        [
            hx + 44 * u,
            hy + 4 * u
        ],
        [
            hx + 47.5 * u,
            hy + 9 * u
        ],
        [
            hx + 43 * u,
            hy + 10 * u
        ]
    ], 3 * u);
    mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
    if (moustache) taper(p, [
        hx + 41 * u,
        hy + 13.5 * u
    ], [
        hx + 25 * u,
        hy + (stout ? 11.5 : 16) * u
    ], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
    if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
const hatBehind = (p, o, H, cx, hc, light, thick, ow, side)=>{
    if (o.hat !== "bonnet") return;
    const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, {
        ...H,
        a: H.a * 1.17,
        b: H.b * 1.13,
        asym: 0,
        egg: 0.04,
        seed: H.seed + 3
    });
    p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
    p.inkRing(bb, ow * 0.85, thick);
};
const hatOn = (p, o, hp, H, cx, hc, light, seed, facing, side)=>{
    const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
    const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5));
    const R = (pts)=>rotPts(pts, a, cx, hc);
    const sag = (yb, wb)=>{
        const base = [];
        for(let i = 0; i <= 12; i++){
            const t = i / 12;
            base.push([
                cx + wb * (2 * t - 1),
                yb + 3 * u * (1 - (2 * t - 1) ** 2)
            ]);
        }
        return base;
    };
    if (o.hat === "shako" || o.hat === "shako_tall") {
        const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
        const body = R([
            ...sag(yb, wb).reverse(),
            [
                cx - wt,
                yb - ht
            ],
            [
                cx + wt,
                yb - ht
            ]
        ]);
        p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
        if (tall) p.clip(body, ()=>p.band(R([
                [
                    cx - wt - 5 * u,
                    yb - ht + 0.07 * HH
                ],
                [
                    cx + wt + 5 * u,
                    yb - ht + 0.07 * HH
                ]
            ]), "#e8c45a", 0.06 * HH, 1.5 * u));
        p.poly(body, null, ow);
        const deg = a * 180 / Math.PI;
        if (side) {
            p.poly(R([
                [
                    cx + 36 * u,
                    yb - 1 * u
                ],
                [
                    cx + 60 * u,
                    yb + 8 * u
                ],
                [
                    cx + 34 * u,
                    yb + 6 * u
                ]
            ]), "#16171b", 2.5 * u);
            const [tx, ty] = R([
                [
                    cx + 24 * u,
                    yb - ht - 6 * u
                ]
            ])[0];
            p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
        } else {
            const [px, py] = R([
                [
                    cx + 3 * u * facing,
                    yb + 3 * u
                ]
            ])[0];
            p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg);
            const [bx, by] = R([
                [
                    cx,
                    yb - 0.45 * ht
                ]
            ])[0];
            p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg);
            p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
            const [tx, ty] = R([
                [
                    cx,
                    yb - ht - 6 * u
                ]
            ])[0];
            p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
        }
    } else if (o.hat === "cap" || o.hat === "hair") {
        const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
        const keep = (x, y)=>y < cut || side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b;
        const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i)=>keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
        const arc = [
            ...hp.slice(startIdx),
            ...hp.slice(0, startIdx)
        ].filter(([x, y])=>keep(x, y)).map(([x, y])=>[
                cx + (x - cx) * 1.03,
                hc + (y - hc) * 1.03
            ]);
        if (arc.length < 3) return;
        if (o.hat === "hair") {
            const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
            for(let i = 1; i < 6; i++)arc.push([
                x0 + (x1 - x0) * i / 6,
                y0 + (y1 - y0) * i / 6 + (i % 2 ? 4 * u : 0)
            ]);
        }
        const col = o.hat === "cap" ? o.cap : o.hair;
        p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
        p.poly(arc, null, ow);
        if (o.hat === "hair") {
            const s = side ? -1 : facing || 1;
            p.stroke([
                [
                    cx + s * 10 * u,
                    cut - 30 * u
                ],
                [
                    cx + s * 2 * u,
                    cut - 12 * u
                ]
            ], 1.2 * u);
        }
        if (o.hat === "cap") {
            const deg = a * 180 / Math.PI;
            if (side) p.poly(R([
                [
                    cx + 40 * u,
                    cut - 2 * u
                ],
                [
                    cx + 74 * u,
                    cut + 4 * u
                ],
                [
                    cx + 40 * u,
                    cut + 6 * u
                ]
            ]), shade(col, 0.8), ow);
            else {
                const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([
                    [
                        cx + s * 4 * u,
                        cut + 1.5 * u
                    ]
                ])[0];
                p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
            }
        }
    } else if (o.hat === "tophat") {
        const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
        const body = R([
            ...sag(yb, wb).reverse(),
            [
                cx - wt,
                yb - ht
            ],
            [
                cx + wt,
                yb - ht
            ]
        ]);
        p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
        p.clip(body, ()=>p.band(R([
                [
                    cx - wt - 4 * u,
                    yb - 0.13 * HH
                ],
                [
                    cx + wt + 4 * u,
                    yb - 0.13 * HH
                ]
            ]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
        p.poly(body, null, ow);
        const [bx, by] = R([
            [
                cx,
                yb + 1 * u
            ]
        ])[0];
        p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, a * 180 / Math.PI);
    } else if (o.hat === "bonnet") {
        const [bx, by] = R([
            [
                cx + (side ? 6 * u : 0),
                crown + 0.16 * HH
            ]
        ])[0];
        p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
        p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
        const cy = hc + H.b * 0.98;
        p.stroke([
            [
                cx - 14 * u,
                cy - 4 * u
            ],
            [
                cx,
                cy + 2 * u
            ],
            [
                cx + 14 * u,
                cy - 4 * u
            ]
        ], 2 * u, BONNET_BRIM);
    }
};
const BUILD = {
    adult: {
        a: 118,
        torso: 1.1,
        legs: 1.4,
        tw: 0.8
    },
    stout: {
        a: 118,
        torso: 1.15,
        legs: 1.32,
        tw: 0.92
    },
    kid: {
        a: 112,
        torso: 0.85,
        legs: 1.0,
        tw: 0.72
    }
};
const footStroke = (p, a, b, w, col)=>{
    if (col !== INK) p.stroke([
        a,
        b
    ], w + 3, INK);
    p.stroke([
        a,
        b
    ], w, col);
};
export const bodyFront = (p, o, opts)=>{
    const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave, light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
    const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
    const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
    const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
    const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
    const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
    const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
    const thick = thickAngle(light), ow = 5 * u;
    const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
    const legW = 5.8 * u, footW = 7.5 * u;
    p.rot = null;
    if (mode === "sit") {
        for (const side of [
            -1,
            1
        ]){
            const h = [
                300 + side * 15 * u,
                hipY
            ], k = [
                300 + side * 36 * u,
                hipY + 0.2 * HH
            ], f = [
                300 + side * 44 * u,
                sole - 8 * u
            ];
            p.stroke(curve(h, k, f), legW, legCol);
            footStroke(p, [
                f[0] - side * 2 * u,
                f[1]
            ], [
                f[0] + side * 12 * u,
                f[1] - 5 * u
            ], footW, footCol);
        }
    } else if (mode === "fall") {
        const legs = [
            [
                [
                    300 - 15 * u,
                    hipY
                ],
                [
                    300 - 46 * u,
                    hipY + 0.5 * HH
                ],
                [
                    300 - 70 * u,
                    hipY + 0.72 * HH
                ]
            ],
            [
                [
                    300 + 15 * u,
                    hipY
                ],
                [
                    300 + 50 * u,
                    hipY + 0.45 * HH
                ],
                [
                    300 + 76 * u,
                    hipY + 0.22 * HH
                ]
            ]
        ];
        legs.forEach(([h, k, f], i)=>{
            p.stroke(curve(h, k, f), legW, legCol);
            footStroke(p, f, [
                f[0] + (i ? 14 : -14) * u,
                f[1] + (i ? -6 : 4) * u
            ], footW, footCol);
        });
    } else if (o.dress) {
        for (const side of [
            -1,
            1
        ]){
            const fx = 300 + side * 12 * u, fy = sole - 4 * u;
            p.stroke([
                [
                    fx,
                    sole - 0.4 * HH
                ],
                [
                    fx + side * u,
                    fy
                ]
            ], legW, legCol);
            footStroke(p, [
                fx - side * 3 * u,
                fy
            ], [
                fx + side * 12 * u,
                fy + u
            ], footW, footCol);
        }
    } else {
        const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
        for (const [side, ph] of [
            [
                -1,
                0
            ],
            [
                1,
                0.5
            ]
        ]){
            const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
            const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
            const k = [
                (hx + fx) / 2 + side * (1.5 * u + up * 0.16),
                (hipY + fy) / 2 - up * 0.08
            ];
            p.stroke(curve([
                hx,
                hipY
            ], k, [
                fx,
                fy
            ]), legW, legCol);
            footStroke(p, [
                fx - side * 3 * u,
                fy
            ], [
                fx + side * 13 * u,
                fy + 0.5 * u
            ], footW, footCol);
        }
    }
    const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
    const A = tilt + sway;
    p.rot = A ? [
        rad(A),
        300,
        hipY
    ] : null;
    const dress = !!o.dress && mode !== "sit" && mode !== "fall";
    const T = {
        a: Bd.tw / 2 * W / 1.06,
        b: 0.5 * (torsoBot - (chin - 0.25 * HH)),
        nTop: 2.2,
        nBot: 2.6,
        egg: o.build === "stout" ? 0.17 : 0.12,
        asym: 0.04 * facing,
        rot: 0,
        noise: 0.006,
        seed: seed + 7
    };
    const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
    const sh = (side)=>[
            tcx + side * 0.85 * T.a,
            chin + 0.12 * HH
        ];
    const hang = (side, fwd)=>{
        const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
        const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
        return [
            S,
            [
                ex,
                S[1] + 0.48 * HH
            ],
            [
                hx,
                chin + 1.04 * HH - Math.abs(fwd) * 9 * u
            ]
        ];
    };
    const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
    const R0 = [
        300 + 47 * u,
        torsoBot + 0.12 * HH
    ], R1 = [
        300 + 64 * u,
        crown - 0.32 * HH
    ];
    const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
    const arms = [];
    if (mode === "sit") for (const side of [
        -1,
        1
    ])arms.push({
        pts: [
            sh(side),
            [
                tcx + side * (1.1 * T.a + 6 * u),
                sh(side)[1] + 0.4 * HH
            ],
            [
                tcx + side * (1.2 * T.a + 10 * u),
                torsoBot + 0.04 * HH
            ]
        ],
        front: false
    });
    else if (mode === "fall") for (const side of [
        -1,
        1
    ])arms.push({
        pts: [
            sh(side),
            [
                tcx + side * (1.15 * T.a + 12 * u),
                sh(side)[1] - 0.25 * HH
            ],
            [
                tcx + side * (1.3 * T.a + 24 * u),
                sh(side)[1] - 0.68 * HH
            ]
        ],
        front: false
    });
    else {
        arms.push({
            pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw),
            front: false
        });
        if (rifle) {
            const G = lerp2(R0, R1, 0.1);
            arms.push({
                pts: [
                    sh(1),
                    [
                        tcx + 1.12 * T.a + 5 * u,
                        sh(1)[1] + 0.45 * HH
                    ],
                    G
                ],
                front: false
            });
        } else if (wave !== undefined) {
            const S = sh(1);
            arms.push({
                pts: [
                    S,
                    [
                        tcx + 1.1 * T.a + 10 * u + 3 * u * wave,
                        S[1] - 0.22 * HH
                    ],
                    [
                        tcx + 1.18 * T.a + 16 * u + 12 * u * wave,
                        S[1] - 0.6 * HH
                    ]
                ],
                front: false
            });
        } else if (prop === "icecream") {
            const S = sh(1);
            arms.push({
                pts: [
                    S,
                    [
                        tcx + 1.05 * T.a + 4 * u,
                        S[1] + 0.45 * HH
                    ],
                    [
                        tcx + 0.5 * T.a,
                        S[1] + 0.4 * HH
                    ]
                ],
                front: true
            });
        } else if (Array.isArray(prop)) {
            const S = sh(1), k = clamp(prop[1], 0, 1);
            const E = lerp2([
                tcx + 1.1 * T.a + 10 * u,
                S[1] - 0.15 * HH
            ], [
                tcx + 1.2 * T.a + 10 * u,
                S[1] + 0.3 * HH
            ], k);
            const Hd = lerp2([
                tcx + 1.15 * T.a + 14 * u,
                S[1] - 0.55 * HH
            ], [
                tcx + 1.45 * T.a + 22 * u,
                S[1] + 0.35 * HH
            ], k);
            arms.push({
                pts: [
                    S,
                    E,
                    Hd
                ],
                front: true
            });
        } else arms.push({
            pts: hang(1, sw),
            front: false
        });
    }
    const drawArm = (a)=>{
        p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
        p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u);
    };
    if (rifle) {
        p.band([
            R0,
            R1
        ], "#7a4b2a", 5 * u, 1.5 * u, "round");
        p.band([
            lerp2(R0, R1, 0.6),
            R1
        ], "#8d949c", 2.4 * u, 1.2 * u, "round");
    }
    if (o.sword && mode !== "sit") {
        const s0 = [
            tcx - 0.75 * T.a,
            torsoBot - 0.2 * HH
        ];
        p.band([
            s0,
            [
                s0[0] - Math.sin(rad(25)) * 0.8 * HH,
                s0[1] + Math.cos(rad(25)) * 0.8 * HH
            ]
        ], "#c9ccd2", 3 * u, 1.2 * u, "round");
    }
    for (const a of arms)if (!a.front) drawArm(a);
    if (dress) {
        const D = {
            a: 0.5 * W * 0.98,
            b: 0.5 * (sole - 0.35 * HH - (chin - 0.2 * HH)),
            nTop: 2.0,
            nBot: 3.0,
            egg: 0.35,
            asym: 0.03 * facing,
            rot: 0,
            noise: 0.006,
            seed: seed + 9
        };
        const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
        p.gradFill(dp, o.dress, mul(o.dress, SH_CLOTH), light);
        p.inkRing(dp, ow, thick);
        const Sw = {
            a: 0.37 * W,
            b: 0.3 * HH,
            nTop: 2.2,
            nBot: 2.4,
            egg: 0.1,
            asym: 0,
            rot: 0,
            noise: 0.006,
            seed: seed + 8
        };
        const sp = blobPts(300, chin + 0.12 * HH, Sw);
        p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
        p.inkRing(sp, ow * 0.9, thick);
    } else {
        p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
        p.clip(tp, ()=>{
            if (o.belt) {
                for (const s of [
                    -1,
                    1
                ])p.band([
                    [
                        tcx - s * 0.75 * T.a,
                        chin - 0.05 * HH
                    ],
                    [
                        tcx + s * 0.8 * T.a,
                        torsoBot - 0.1 * HH
                    ]
                ], o.belt, 5.5 * u, 1.8 * u);
                const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
                p.poly([
                    [
                        xc - 3.5 * u,
                        yc - 3.5 * u
                    ],
                    [
                        xc + 3.5 * u,
                        yc - 3.5 * u
                    ],
                    [
                        xc + 3.5 * u,
                        yc + 3.5 * u
                    ],
                    [
                        xc - 3.5 * u,
                        yc + 3.5 * u
                    ]
                ], "#d9dde0", 1.5 * u);
            }
            if (o.sash) p.band([
                [
                    tcx - 1.3 * T.a,
                    torsoBot - 0.32 * HH
                ],
                [
                    tcx + 1.3 * T.a,
                    torsoBot - 0.32 * HH
                ]
            ], o.sash, 0.13 * HH, 1.8 * u);
            for(let i = 0; i < 4; i++){
                const y = chin + 0.12 * HH + i * 0.2 * HH;
                if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
                p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK);
                p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
            }
        });
        if (o.sash) {
            const s = facing || 1;
            p.poly([
                [
                    tcx + s * 0.55 * T.a,
                    torsoBot - 0.3 * HH
                ],
                [
                    tcx + s * 0.75 * T.a,
                    torsoBot + 0.05 * HH
                ],
                [
                    tcx + s * 0.45 * T.a,
                    torsoBot + 0.02 * HH
                ]
            ], o.sash, 1.6 * u);
        }
        p.inkRing(tp, ow, thick);
    }
    for (const a of arms)if (a.front) {
        drawArm(a);
        const [hx, hy] = a.pts[2];
        if (prop === "icecream") {
            p.poly([
                [
                    hx - 8 * u,
                    hy - 12 * u
                ],
                [
                    hx + 8 * u,
                    hy - 12 * u
                ],
                [
                    hx,
                    hy + 7 * u
                ]
            ], "#e0a35a", 1.8 * u);
            p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
            p.dot(hx, hy, 5.5 * u);
        } else if (Array.isArray(prop)) {
            const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
            const Rh = (pts)=>rotPts(pts, ang, hx, hy);
            p.band(Rh([
                [
                    hx,
                    hy + 12 * u
                ],
                [
                    hx,
                    hy - 44 * u
                ]
            ]), "#8a5a34", 5 * u, 1.5 * u, "round");
            p.poly(Rh([
                [
                    hx - 12 * u,
                    hy - 58 * u
                ],
                [
                    hx + 20 * u,
                    hy - 58 * u
                ],
                [
                    hx + 20 * u,
                    hy - 42 * u
                ],
                [
                    hx - 12 * u,
                    hy - 42 * u
                ]
            ]), "#7d848c", 2.2 * u);
            p.dot(hx, hy, 5.5 * u);
        }
    }
    if (prop === "shako") {
        const [hx, hy] = arms[0].pts[2];
        p.poly([
            [
                hx - 14 * u,
                hy + 3 * u
            ],
            [
                hx + 14 * u,
                hy + 3 * u
            ],
            [
                hx + 16 * u,
                hy + 30 * u
            ],
            [
                hx - 16 * u,
                hy + 30 * u
            ]
        ], "#3a3d47", 2.2 * u);
        p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
        p.dot(hx, hy, 5.5 * u);
    }
    const Ah = A + headTilt, [cpx, cpy] = rotAbout([
        300,
        chin
    ], rad(A), [
        300,
        hipY
    ]);
    p.rot = Ah ? [
        rad(Ah),
        300,
        chin,
        cpx - 300,
        cpy - chin
    ] : null;
    hatBehind(p, o, H, 300, hc, light, thick, ow, false);
    const hp = blobPts(300, hc, H);
    p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
    p.inkRing(hp, ow, thick);
    hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
    p.rot = null;
};
const ik = (hip, ank, l1, l2)=>{
    const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
    const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
    return [
        hip[0] + l1 * Math.cos(k),
        hip[1] + l1 * Math.sin(k)
    ];
};
const SWING_HIP = 733;
export const bodySide = (p, o, opts)=>{
    const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
    const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
    const H = {
        ...headBlob(seed, Bd.a, 1),
        asym: 0.12,
        rot: rad(3 + 3 * (rnd(seed, 7) - 0.5))
    };
    const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
    const thick = thickAngle(light), ow = 5 * u;
    const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
    const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
    const legs = [];
    let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
    if (mode === "march") {
        const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
        const st = (ph)=>{
            const c = ((phase + ph) % 1 + 1) % 1;
            if (c < 0.5) {
                const s = c / 0.5;
                return {
                    x: S / 2 - S * s,
                    h: 0,
                    stance: true,
                    s
                };
            }
            const s = (c - 0.5) / 0.5;
            return {
                x: -S / 2 + S * s - S / Math.PI * Math.sin(2 * Math.PI * s),
                h: liftH * Math.sin(Math.PI * s),
                stance: false,
                s
            };
        };
        const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
        const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
        hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
        for (const [L, near] of [
            [
                fL,
                false
            ],
            [
                nL,
                true
            ]
        ])legs.push({
            ank: [
                300 + L.x,
                ankY - L.h
            ],
            pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)),
            near
        });
        lean = 4 + 3 * Math.cos(2 * two * phase);
        nearFwd = nL.x / (S / 2);
    } else if (mode === "push") {
        hipY = ankY - 0.87 * legLen;
        legs.push({
            ank: [
                300 - 0.5 * legLen,
                ankY
            ],
            pitch: rad(-8),
            near: false
        }, {
            ank: [
                300 + 0.32 * legLen,
                ankY
            ],
            pitch: 0,
            near: true
        });
        lean = 14 * pose;
    } else if (mode === "swing") {
        hipY = SWING_HIP;
        const a = rad(60 * pose);
        for (const [dx, near] of [
            [
                -6,
                false
            ],
            [
                0,
                true
            ]
        ]){
            const knee = [
                300 + l1 * 0.98 + dx * u,
                hipY + 6 * u
            ];
            legs.push({
                ank: [
                    knee[0] + l2 * Math.sin(a),
                    knee[1] + l2 * Math.cos(a)
                ],
                pitch: -a * 0.5,
                near
            });
        }
    } else {
        legs.push({
            ank: [
                300 - 4 * u,
                ankY
            ],
            pitch: 0,
            near: false
        }, {
            ank: [
                300 + 4 * u,
                ankY
            ],
            pitch: 0,
            near: true
        });
    }
    const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip = [
        300,
        hipY
    ];
    p.rot = null;
    for (const L of legs){
        const knee = mode === "swing" ? [
            300 + l1 * 0.98 + (L.near ? 0 : -6 * u),
            hipY + 6 * u
        ] : ik(hip, L.ank, l1, l2);
        const hp0 = [
            300 + (L.near ? 0 : -5 * u),
            hipY
        ];
        p.stroke([
            hp0,
            knee,
            L.ank
        ], 5.8 * u, L.near ? nearCol : farCol);
        const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
        footStroke(p, [
            L.ank[0] - 3 * u * c,
            L.ank[1] - 3 * u * s
        ], [
            L.ank[0] + 13 * u * c,
            L.ank[1] + 13 * u * s + 0.5 * u
        ], 7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
    }
    p.rot = lean ? [
        rad(lean),
        300,
        hipY
    ] : null;
    const T = {
        a: (o.build === "stout" ? 0.36 : 0.31) * W,
        b: 0.5 * (torsoBot - (chin - 0.25 * HH)),
        nTop: 2.2,
        nBot: 2.5,
        egg: 0.1,
        asym: 0.06,
        rot: 0,
        noise: 0.006,
        seed: seed + 7
    };
    const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
    const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
    const S = [
        tcx + 0.05 * T.a,
        chin + 0.14 * HH
    ], aLen = 0.95 * HH;
    const swingArm = (ang)=>{
        const e = [
            S[0] + Math.sin(ang) * aLen * 0.5,
            S[1] + Math.cos(ang) * aLen * 0.5
        ], a2 = ang + rad(16) * Math.sign(ang || 1);
        return [
            S,
            e,
            [
                e[0] + Math.sin(a2) * aLen * 0.5,
                e[1] + Math.cos(a2) * aLen * 0.5
            ]
        ];
    };
    const rifle = !!o.rifle && (mode === "march" || mode === "stand");
    const B0 = [
        tcx + 0.72 * T.a,
        chin + 0.58 * HH
    ], B1 = [
        tcx - 0.95 * T.a - 22 * u,
        crown - 0.4 * HH
    ];
    let near, far;
    if (mode === "swing") {
        near = [
            S,
            [
                S[0] + 12 * u,
                S[1] - 0.16 * HH
            ],
            [
                300 + 6 * u,
                chin - 0.3 * HH
            ]
        ];
        far = [
            S,
            [
                S[0] + 8 * u,
                S[1] - 0.18 * HH
            ],
            [
                300 + 2 * u,
                chin - 0.36 * HH
            ]
        ];
    } else if (mode === "push") {
        const reach = 0.55 * HH + 0.45 * HH * pose;
        let hN = [
            S[0] + reach,
            S[1] + 0.06 * HH
        ];
        if (opts.hand) {
            const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
            const tg = [
                300 + dx * Math.cos(th) - dy * Math.sin(th),
                hipY + dx * Math.sin(th) + dy * Math.cos(th)
            ];
            hN = [
                hN[0] + (tg[0] - hN[0]) * pose,
                hN[1] + (tg[1] - hN[1]) * pose
            ];
        }
        near = [
            S,
            [
                (S[0] + hN[0]) / 2,
                (S[1] + hN[1]) / 2 + 0.06 * HH
            ],
            hN
        ];
        far = [
            S,
            [
                (S[0] + hN[0]) / 2 - 4 * u,
                (S[1] + hN[1]) / 2 - 0.02 * HH
            ],
            [
                hN[0] - 6 * u,
                hN[1] - 0.08 * HH
            ]
        ];
    } else if (rifle) {
        near = [
            S,
            [
                S[0] - 4 * u,
                S[1] + 0.42 * HH
            ],
            B0
        ];
        far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0);
    } else {
        near = swingArm(rad(-30) * nearFwd);
        far = mode === "march" ? swingArm(rad(30) * nearFwd) : null;
    }
    if (far) {
        p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm);
        p.dot(far[2][0], far[2][1], 5.5 * u);
    }
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, ()=>{
        if (o.belt) p.band([
            [
                tcx - 0.65 * T.a,
                chin - 0.05 * HH
            ],
            [
                tcx + 0.75 * T.a,
                torsoBot - 0.1 * HH
            ]
        ], o.belt, 5.5 * u, 1.8 * u);
        if (o.sash) p.band([
            [
                tcx - 1.3 * T.a,
                torsoBot - 0.32 * HH
            ],
            [
                tcx + 1.3 * T.a,
                torsoBot - 0.32 * HH
            ]
        ], o.sash, 0.13 * HH, 1.8 * u);
        if (!o.dress) for(let i = 0; i < 3; i++){
            const y = chin + 0.16 * HH + i * 0.24 * HH;
            p.dot(tcx + 0.8 * T.a, y, 3 * u, INK);
            p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
        }
    });
    p.inkRing(tp, ow, thick);
    if (rifle) {
        p.band([
            B0,
            B1
        ], "#7a4b2a", 5 * u, 1.5 * u, "round");
        p.band([
            lerp2(B0, B1, 0.6),
            B1
        ], "#8d949c", 2.4 * u, 1.2 * u, "round");
    }
    p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol);
    p.dot(near[2][0], near[2][1], 5.5 * u);
    const hx = 300 + 4 * u;
    hatBehind(p, o, H, hx, hc, light, thick, ow, true);
    const hp = blobPts(hx, hc, H);
    p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
    p.inkRing(hp, ow, thick);
    hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
    const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
    faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
    p.rot = null;
};
export const swingKid = (p, o, kick, expr, light = DEF_LIGHT, blink = 0)=>{
    const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
    const seat = rope + 18, x0 = 150, x1 = 550;
    p.line([
        [
            350,
            20
        ],
        [
            x0 + 16,
            seat + 4
        ]
    ], "#a07a4c", 10);
    p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
    const g = p.g;
    g.save();
    g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
    g.scale(k, k);
    bodySide(new Pen(g), o, {
        expr,
        mode: "swing",
        pose: kick,
        light,
        seed: 5,
        blink
    });
    g.restore();
    p.line([
        [
            350,
            20
        ],
        [
            x1 - 16,
            seat + 4
        ]
    ], "#a07a4c", 10);
};
export const fxNote = (p, kind, col = "#1f2a44")=>{
    p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
    p.stroke([
        [
            110,
            190
        ],
        [
            110,
            40
        ]
    ], 14);
    if (kind === 0) p.poly([
        [
            110,
            40
        ],
        [
            170,
            70
        ],
        [
            170,
            110
        ],
        [
            110,
            82
        ]
    ], col, 8);
    else {
        p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
        p.stroke([
            [
                186,
                160
            ],
            [
                186,
                20
            ]
        ], 14);
        p.poly([
            [
                110,
                40
            ],
            [
                186,
                20
            ],
            [
                186,
                50
            ],
            [
                110,
                70
            ]
        ], col, 8);
    }
};
export const fxBurst = (p, t, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230)=>{
    const c = 250, e = 1 - (1 - t) ** 3;
    for(let i = 0; i < rays; i++){
        const a = rad(i * 360 / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
        p.poly([
            [
                c + r0 * 0.5 * Math.cos(a + 0.18),
                c + r0 * 0.5 * Math.sin(a + 0.18)
            ],
            [
                c + ra * Math.cos(a),
                c + ra * Math.sin(a)
            ],
            [
                c + r0 * 0.5 * Math.cos(a - 0.18),
                c + r0 * 0.5 * Math.sin(a - 0.18)
            ]
        ], col, Math.max(3, 8 * (1 - t)));
    }
    if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};
export const fxSplash = (p, t)=>{
    const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
    const blue = "#bfe8ff", deep = "#6cc0f0";
    if (rise > 0.02) {
        const pts = [];
        for(let i = 0; i < 19; i++){
            const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
            pts.push([
                c - 330 + 660 * i / 18,
                size - 120 - h
            ]);
        }
        p.poly([
            ...pts,
            [
                c + 330,
                size - 90
            ],
            [
                c - 330,
                size - 90
            ]
        ], blue, 10);
        p.ell(c, size - 100, 360, 46, deep, 10);
    }
    for(let i = 0; i < 8; i++){
        const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
        if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
    }
};
export const fxPuff = (p, t)=>{
    for(let i = 0; i < 5; i++){
        const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
        p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
    }
};
export const fxStars = (p, t)=>{
    for(let i = 0; i < 4; i++){
        const a = t * Math.PI * 2 + i * Math.PI / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts = [];
        for(let k = 0; k < 10; k++){
            const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90);
            pts.push([
                x + r * Math.cos(b),
                y + r * Math.sin(b)
            ]);
        }
        p.poly(pts, "#ffd84a", 6);
    }
};
export const fxCreak = (p, t)=>{
    const j = 6 * Math.sin(t * 40);
    for (const a of [
        -30,
        0,
        30
    ]){
        const b = rad(a - 90);
        p.stroke([
            [
                150 + 70 * Math.cos(b) + j,
                230 + 70 * Math.sin(b)
            ],
            [
                150 + 100 * Math.cos(b) + 10 + j,
                230 + 100 * Math.sin(b)
            ],
            [
                150 + 130 * Math.cos(b) + j,
                230 + 130 * Math.sin(b)
            ]
        ], 10);
    }
};
export const fxRing = (p, t)=>{
    const g = p.g;
    for(let k = 0; k < 3; k++){
        const u = t - k * 0.22;
        if (u <= 0 || u >= 1) continue;
        g.beginPath();
        g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
        g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa";
        g.lineWidth = 9 * (1 - u) + 3;
        g.stroke();
    }
};
export const fxSign = (p)=>{
    const g = p.g, RED = "#d42f2f";
    p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
    p.poly(rrect(14, 14, 686, 506, 40), null, 14);
    p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
    g.beginPath();
    g.moveTo(112, 470);
    g.quadraticCurveTo(350, 300, 588, 470);
    g.strokeStyle = INK;
    g.lineWidth = 16;
    g.lineCap = "round";
    g.stroke();
    for (const x of [
        88,
        612
    ])p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
    for (const x of [
        150,
        278,
        406,
        534
    ]){
        p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);
        p.stroke([
            [
                x - 8,
                210
            ],
            [
                x + 34,
                262
            ],
            [
                x + 46,
                338
            ]
        ], 15, INK);
        p.stroke([
            [
                x + 6,
                210
            ],
            [
                x - 12,
                274
            ],
            [
                x - 36,
                336
            ]
        ], 15, INK);
        p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);
        p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
    }
    for (const [a, b] of [
        [
            [
                96,
                70
            ],
            [
                604,
                452
            ]
        ],
        [
            [
                604,
                70
            ],
            [
                96,
                452
            ]
        ]
    ]){
        p.stroke([
            a,
            b
        ], 58, "#ffffff");
        p.stroke([
            a,
            b
        ], 42, RED);
    }
};
export const fxCloud = (p, seed)=>{
    const blobs = [
        [
            150,
            190,
            80
        ],
        [
            250,
            150,
            105
        ],
        [
            360,
            160,
            95
        ],
        [
            450,
            195,
            70
        ],
        [
            300,
            210,
            90
        ]
    ];
    for (const [x, y, r] of blobs)p.ell(x + seed * 37 % 20 - 10, y, r, r * 0.8, "#ffffff", 0);
    p.ell(300, 235, 230, 40, "#ffffff", 0);
};
export const fxShadow = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 256);
    g.save();
    g.filter = "blur(9px)";
    const lg = g.createLinearGradient(0, 205, 0, 22);
    lg.addColorStop(0, mix(col, WHITE, 0.08));
    lg.addColorStop(0.55, mix(col, WHITE, 0.3));
    lg.addColorStop(1, mix(col, WHITE, 0.85));
    g.fillStyle = lg;
    g.beginPath();
    g.moveTo(40, 205);
    g.bezierCurveTo(36, 120, 46, 50, 64, 30);
    g.bezierCurveTo(82, 50, 92, 120, 88, 205);
    g.closePath();
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
};
export const fxContact = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 128);
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [r, k] of [
        [
            0,
            0
        ],
        [
            0.32,
            0.02
        ],
        [
            0.5,
            0.22
        ],
        [
            0.66,
            0.58
        ],
        [
            0.82,
            0.88
        ],
        [
            1,
            1
        ]
    ])gr.addColorStop(r, mix(col, WHITE, k));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
};
export const fxPlank = (p)=>{
    p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
    p.line([
        [
            40,
            46
        ],
        [
            150,
            44
        ],
        [
            270,
            50
        ]
    ], "#7d5234", 4);
    p.line([
        [
            60,
            62
        ],
        [
            200,
            64
        ],
        [
            284,
            60
        ]
    ], "#7d5234", 4);
    p.dot(36, 54, 5, INK);
    p.dot(284, 54, 5, INK);
};
export const fxDrum = (p)=>{
    p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
    p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
    p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
    p.line([
        [
            52,
            88
        ],
        [
            82,
            172
        ],
        [
            112,
            88
        ],
        [
            142,
            172
        ],
        [
            172,
            88
        ],
        [
            202,
            172
        ]
    ], INK, 6);
    p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};
export const fxBlob = (p, col)=>{
    const g = p.g;
    g.fillStyle = WHITE;
    g.fillRect(0, 0, 128, 128);
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [r, k] of [
        [
            0,
            0
        ],
        [
            0.5,
            0.04
        ],
        [
            0.64,
            0.18
        ],
        [
            0.76,
            0.42
        ],
        [
            0.87,
            0.72
        ],
        [
            0.95,
            0.92
        ],
        [
            1,
            1
        ]
    ])gr.addColorStop(r, mix(col, WHITE, k));
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
};
FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };

// ================= cast.js — Beyin serisi: people, the Brain host, wordless props & fx =================
// (concatenated after toonbase.js + roman.js into toon.js; uses Pen, blobPts, headBlob, faceFront, hatOn ...)
FACE.sad = { eye: ["small", "small"], brow: [-5, 3], mouth: "frown" };
FACE.angry = { eye: ["lid", "lid"], brow: [7, -4], mouth: "teeth" };
FACE.calm = { eye: ["happy", "happy"], brow: [-1, 0], mouth: "smile" };
FACE.sleepy = { eye: ["slit", "slit"], brow: [-2, 2], mouth: "o" };
FACE.yuck = { eye: ["squeeze", "squeeze"], brow: [4, -3], mouth: "wave" };
FACE.bliss = { eye: ["happy", "happy"], brow: [-4, -3], mouth: "smileWide" };
FACE.ouch = { eye: ["squeeze", "squeeze"], brow: [-4, 2], mouth: "O" };
FACE.skeptic = { eye: ["slit", "lid"], brow: [3, -1], mouth: "smirk" };
FACE.wink = { eye: ["happy", "dot"], brow: [0, -3], mouth: "smirk" };
FACE.proud = { eye: ["happy", "happy"], brow: [-2, -5], mouth: "smirk" };
FACE.blank = { eye: ["dot", "dot"], brow: [0, -1], mouth: "dash" };
FACE.gape = { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" };
FACE.shrug = { eye: ["lid", "lid"], brow: [-6, -6], mouth: "frown" };
FACE.blow = { eye: ["happy", "happy"], brow: [-2, -4], mouth: "o" };

const PINK = "#f6a0bd", PINK_D = "#d9688f", PINK_L = "#ffd0de";
const deg = (d) => d * Math.PI / 180;
const mixc = (a, b, t) => mix(a, b, Math.max(0, Math.min(1, t)));

// ---------- tiny icons (used on paper, labels, brochures — never letters or digits) ----------
export const icon = {
  coin: (p, x, y, r) => { p.ell(x, y, r, r, "#f2c14e", r * 0.16); p.ell(x, y, r * 0.62, r * 0.62, null, r * 0.08); p.ell(x - r * 0.3, y - r * 0.3, r * 0.18, r * 0.12, "#fff4c8", 0); },
  coinStack: (p, x, y, r, n = 5) => { for (let i = 0; i < n; i++) { const yy = y - i * r * 0.42; p.ell(x, yy + r * 0.2, r, r * 0.38, "#c99a2e", r * 0.14); p.ell(x, yy, r, r * 0.38, "#f2c14e", r * 0.14); } p.dot(x - r * 0.4, y - (n - 1) * r * 0.42 - r * 0.05, r * 0.12, "#fff4c8"); },
  tag: (p, x, y, s, col = "#e04545") => { const pts = [[x - s, y - s * 0.55], [x + s * 0.5, y - s * 0.55], [x + s, y], [x + s * 0.5, y + s * 0.55], [x - s, y + s * 0.55]]; p.poly(pts, col, s * 0.12); p.ell(x + s * 0.45, y, s * 0.13, s * 0.13, "#ffffff", s * 0.06); p.stroke([[x - s * 0.35, y - s * 0.3], [x - s * 0.35, y + s * 0.15]], s * 0.13, "#ffffff"); p.stroke([[x - s * 0.6, y], [x - s * 0.35, y + s * 0.3], [x - s * 0.1, y]], s * 0.13, "#ffffff"); },
  smile: (p, x, y, r, col = "#ffd23f") => { p.ell(x, y, r, r, col, r * 0.14); p.dot(x - r * 0.35, y - r * 0.2, r * 0.13); p.dot(x + r * 0.35, y - r * 0.2, r * 0.13); p.arc(x, y + r * 0.05, r * 0.5, r * 0.42, 20, 160, r * 0.13); },
  frown: (p, x, y, r, col = "#ff8a5c") => { p.ell(x, y, r, r, col, r * 0.14); p.dot(x - r * 0.35, y - r * 0.2, r * 0.13); p.dot(x + r * 0.35, y - r * 0.2, r * 0.13); p.arc(x, y + r * 0.55, r * 0.45, r * 0.32, 200, 340, r * 0.13); },
  tree: (p, x, y, s) => { p.poly([[x - s * 0.08, y + s * 0.5], [x + s * 0.08, y + s * 0.5], [x + s * 0.06, y], [x - s * 0.06, y]], "#7a5434", s * 0.05); p.ell(x, y - s * 0.12, s * 0.42, s * 0.36, "#5cae4a", s * 0.06); },
  brick: (p, x, y, s) => { p.poly([[x - s * 0.5, y - s * 0.4], [x + s * 0.5, y - s * 0.4], [x + s * 0.5, y + s * 0.4], [x - s * 0.5, y + s * 0.4]], "#b5603e", s * 0.06); for (let i = 1; i < 4; i++) p.stroke([[x - s * 0.5, y - s * 0.4 + i * s * 0.2], [x + s * 0.5, y - s * 0.4 + i * s * 0.2]], s * 0.04, "#7a3a24"); for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) { const xx = x - s * 0.25 + k * s * 0.5 + (i % 2) * s * 0.25 - s * 0.12; p.stroke([[xx, y - s * 0.4 + i * s * 0.2], [xx, y - s * 0.2 + i * s * 0.2]], s * 0.04, "#7a3a24"); } },
  pill: (p, x, y, s, col = "#ffffff") => { p.poly(rrect(x - s, y - s * 0.42, x + s, y + s * 0.42, s * 0.42), col, s * 0.16); p.stroke([[x, y - s * 0.42], [x, y + s * 0.42]], s * 0.1); },
  sun: (p, x, y, s) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.stroke([[x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7], [x + Math.cos(a) * s, y + Math.sin(a) * s]], s * 0.12, "#f2a93b"); } p.ell(x, y, s * 0.5, s * 0.5, "#ffd23f", s * 0.1); },
  heart: (p, x, y, s, col = "#ef5b7f") => { const pts = []; for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 2; pts.push([x + s * 0.06 * 16 * Math.sin(t) ** 3, y - s * 0.06 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } p.poly(pts, col, s * 0.1); },
  grape: (p, x, y, s, col = "#7b3b8f") => { for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-0.5, 0], [0.5, 0], [0, 1]]) p.ell(x + dx * s * 0.32, y + dy * s * 0.3, s * 0.2, s * 0.2, col, s * 0.06); p.stroke([[x, y - s * 0.45], [x + s * 0.1, y - s * 0.65]], s * 0.06, "#4a7a2e"); },
  crest: (p, x, y, s) => { const pts = [[x - s * 0.5, y - s * 0.55], [x + s * 0.5, y - s * 0.55], [x + s * 0.5, y + s * 0.05], [x, y + s * 0.6], [x - s * 0.5, y + s * 0.05]]; p.poly(pts, "#7a1830", s * 0.08); p.clip(pts, () => { p.poly([[x - s, y - s], [x, y - s], [x, y + s], [x - s, y + s]], "#9c2440", 0); }); icon.grape(p, x, y - s * 0.02, s * 0.6, "#f2c14e"); p.poly(pts, null, s * 0.08); },
  lines: (p, x, y, w, n, gap, col = "#b9b9c2", lw = 6) => { for (let i = 0; i < n; i++) { const ww = w * (i === n - 1 ? 0.55 : 0.85 + 0.15 * Math.sin(i * 2.7)); p.stroke([[x - w / 2, y + i * gap], [x - w / 2 + ww, y + i * gap]], lw, col); } },
  sparkle: (p, x, y, s, col = "#fff6c4") => { const pts = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? s * 0.28 : s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } p.poly(pts, col, s * 0.12); },
  anchor: (p, x, y, s, col) => { p.stroke([[x, y - s * 0.6], [x, y + s * 0.55]], s * 0.16, col); p.arc(x, y + s * 0.15, s * 0.5, s * 0.42, 10, 170, s * 0.16, col); p.stroke([[x - s * 0.3, y - s * 0.3], [x + s * 0.3, y - s * 0.3]], s * 0.14, col); p.arc(x, y - s * 0.72, s * 0.15, s * 0.15, 0, 360, s * 0.1, col); },
  star: (p, x, y, s, col, ol = 0) => { const pts = []; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? s * 0.42 : s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } p.poly(pts, col, ol); },
};

// ---------- props held in hands ----------
const HELD = {
  cup: (p, x, y, u, o = {}) => { const w = 14 * u, h = 22 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w * 0.8, y + h * 0.6], [x - w * 0.8, y + h * 0.6]], "#fafafa", 2.4 * u); p.poly([[x - w * 0.95, y - h * 0.2], [x + w * 0.95, y - h * 0.2], [x + w * 0.88, y + h * 0.25], [x - w * 0.88, y + h * 0.25]], "#b8763e", 2 * u); p.poly([[x - w * 1.12, y - h - 5 * u], [x + w * 1.12, y - h - 5 * u], [x + w * 1.05, y - h + 2 * u], [x - w * 1.05, y - h + 2 * u]], "#5b3b2a", 2 * u); if (o.slosh) { for (let i = 0; i < 3; i++) p.ell(x + (i - 1) * 10 * u + o.slosh * 8 * u, y - h - 12 * u - Math.abs(o.slosh) * (6 + i * 5) * u, 3.5 * u, 4.5 * u, "#8a5530", 1.2 * u); } p.dot(x, y + 2 * u, 5.5 * u); },
  glass: (p, x, y, u, o = {}) => { const col = o.col || "#f3e6a2", lv = o.level ?? 0.5; const bw = 15 * u, bh = 22 * u, by = y - 30 * u; const bowl = [[x + bw, by - bh * 0.4], ...ellPts(x, by, bw, bh, 0, 180, 0, 20), [x - bw, by - bh * 0.4]]; p.clip(bowl, () => p.poly([[x - bw, by - bh * 0.4 + (1 - lv) * bh * 1.2], [x + bw, by - bh * 0.4 + (1 - lv) * bh * 1.2], [x + bw, by + bh], [x - bw, by + bh]], col, 0)); p.poly(bowl, "#ffffff22", 2.2 * u); p.stroke([[x, by + bh], [x, y + 4 * u]], 2.6 * u); p.stroke([[x - 9 * u, y + 4 * u], [x + 9 * u, y + 4 * u]], 2.6 * u); p.stroke([[x - bw * 0.55, by - bh * 0.1], [x - bw * 0.6, by + bh * 0.4]], 2 * u, "#ffffffcc"); p.dot(x, y + 2 * u, 5.5 * u); },
  notebook: (p, x, y, u) => { const w = 24 * u, h = 30 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], "#f8f4ea", 2.4 * u); p.stroke([[x - w, y - h], [x - w, y + h]], 4 * u, "#7a3b3b"); icon.lines(p, x + 2 * u, y - h + 12 * u, w * 1.4, 5, 10 * u, "#b9b9c2", 2 * u); p.dot(x - w * 0.4, y + h * 0.6, 5.5 * u); },
  clipboard: (p, x, y, u) => { const w = 24 * u, h = 32 * u; p.poly(rrect(x - w, y - h, x + w, y + h, 4 * u), "#b07a46", 2.4 * u); p.poly([[x - w + 5 * u, y - h + 8 * u], [x + w - 5 * u, y - h + 8 * u], [x + w - 5 * u, y + h - 5 * u], [x - w + 5 * u, y + h - 5 * u]], "#fbfbf6", 1.5 * u); p.poly(rrect(x - 9 * u, y - h - 4 * u, x + 9 * u, y - h + 8 * u, 2 * u), "#9aa3ad", 1.8 * u); icon.lines(p, x, y - h + 18 * u, w * 1.4, 4, 10 * u, "#b9b9c2", 2 * u); p.dot(x - w * 0.5, y + h * 0.6, 5.5 * u); },
  stopwatch: (p, x, y, u, o = {}) => { const r = 18 * u; p.poly(rrect(x - 4 * u, y - r - 10 * u, x + 4 * u, y - r + 2 * u, 2 * u), "#9aa3ad", 1.6 * u); p.ell(x, y, r, r, "#e8edf2", 2.6 * u); p.ell(x, y, r * 0.8, r * 0.8, "#ffffff", 1.2 * u); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; p.dot(x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65, 1.3 * u); } const a = (o.t || 0) * Math.PI * 2 - Math.PI / 2; p.stroke([[x, y], [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6]], 2.2 * u, "#d23c3c"); p.dot(x, y, 2 * u); if (!o.nohand) p.dot(x + r * 0.9, y + r * 0.4, 5.5 * u); },
  pill: (p, x, y, u) => { icon.pill(p, x, y - 8 * u, 6 * u); p.dot(x, y + 2 * u, 5.5 * u); },
  key: (p, x, y, u) => { p.ell(x - 12 * u, y - 10 * u, 8 * u, 8 * u, "#e7c255", 2 * u); p.stroke([[x - 6 * u, y - 6 * u], [x + 16 * u, y - 18 * u]], 3.2 * u, "#e7c255"); p.dot(x, y + 1 * u, 5.5 * u); },
  folder: (p, x, y, u, o = {}) => { const w = 26 * u, h = 20 * u; p.poly([[x - w, y - h], [x - w * 0.3, y - h], [x - w * 0.2, y - h - 6 * u], [x + w, y - h - 6 * u], [x + w, y + h], [x - w, y + h]], o.col || "#e8c26a", 2.4 * u); p.poly([[x - w + 4 * u, y - h + 4 * u], [x + w - 4 * u, y - h + 4 * u], [x + w - 4 * u, y + h - 4 * u], [x - w + 4 * u, y + h - 4 * u]], "#fbfbf6", 1.4 * u); icon.lines(p, x + 6 * u, y - h + 12 * u, w * 1.1, 3, 9 * u, "#b9b9c2", 2 * u); if (o.ic === "tree") icon.tree(p, x - w * 0.62, y + 4 * u, 14 * u); if (o.ic === "brick") icon.brick(p, x - w * 0.62, y + 6 * u, 12 * u); p.dot(x, y + h, 5.5 * u); },
  brochure: (p, x, y, u, o = {}) => { const rich = o.kind === "rich", w = 22 * u, h = 30 * u; p.poly([[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], rich ? "#1f2d5c" : "#f1efe6", 2.4 * u); if (rich) { p.poly([[x - w + 4 * u, y - h + 4 * u], [x + w - 4 * u, y - h + 4 * u], [x + w - 4 * u, y + h - 4 * u], [x - w + 4 * u, y + h - 4 * u]], null, 1.5 * u); icon.coinStack(p, x, y - 2 * u, 9 * u, 4); icon.lines(p, x, y + 16 * u, w * 1.3, 2, 7 * u, "#e8c56a", 2 * u); } else { icon.tag(p, x - 4 * u, y - 12 * u, 11 * u); icon.coin(p, x + 10 * u, y + 6 * u, 5 * u); icon.lines(p, x, y + 18 * u, w * 1.3, 2, 7 * u, "#b9b9c2", 2 * u); } if (!o.nohand) p.dot(x - w * 0.6, y + h * 0.5, 5.5 * u); },
  cane: (p, x, y, u) => { p.stroke([[x, y], [x + 2 * u, y + 105 * u]], 3.4 * u, "#6a4a32"); p.arc(x - 7 * u, y, 7 * u, 7 * u, 180, 360, 3.4 * u, "#6a4a32"); p.dot(x, y + 2 * u, 5.5 * u); },
  bag: (p, x, y, u) => { p.poly(rrect(x - 22 * u, y + 2 * u, x + 22 * u, y + 34 * u, 6 * u), "#b5653f", 2.4 * u); p.arc(x, y + 3 * u, 12 * u, 12 * u, 180, 360, 2.6 * u); p.stroke([[x - 22 * u, y + 14 * u], [x + 22 * u, y + 14 * u]], 1.6 * u, "#7a3b24"); p.dot(x, y, 5.5 * u); },
  roller: (p, x, y, u) => { p.stroke([[x, y], [x, y - 40 * u]], 3 * u, "#7a5434"); p.poly(rrect(x - 26 * u, y - 56 * u, x + 26 * u, y - 40 * u, 7 * u), "#f2a6c2", 2 * u); p.dot(x, y, 5.5 * u); },
};

// ---------- person ----------
const BUILDS = { normal: 1, big: 1.38, thin: 0.72, round: 1.22 };
export const person = (p, O, o = {}) => {
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0, mode = "stand", step = 0, light = rad(-120) } = o;
  const lid = lidOf(blink), skin = O.skin ?? SKIN, bk = BUILDS[O.build || "normal"];
  const H = headBlob(seed, O.headA || 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const legsL = mode === "sit" ? 0.9 : (O.legs || 1.38), sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, torsoL = O.build === "big" ? 1.18 : O.build === "thin" ? 1.12 : 1.08;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const top = O.top || "#4f7fb8", pants = O.pants || "#3b3f52", shoes = O.shoes || "#3a2a20";
  const legCol = mix(pants, INK, 0.45), sleeve = O.coat || O.cardigan || O.gown || top;
  const armW = (O.build === "big" ? 8.5 : O.build === "thin" ? 3.6 : 5.4) * u;
  p.rot = null;
  // wheelchair behind
  if (O.wheelchair) {
    const wy = sole - 0.62 * HH;
    p.poly(rrect(cx - 0.62 * W, torsoBot - 0.95 * HH, cx + 0.62 * W, torsoBot + 0.05 * HH, 10 * u), "#3d7fb0", 2.5 * u);
    for (const s of [-1, 1]) { p.ell(cx + s * 0.7 * W, wy, 0.62 * HH, 0.62 * HH, null, 5 * u); p.ell(cx + s * 0.7 * W, wy, 0.56 * HH, 0.56 * HH, null, 2.6 * u, 0, 360); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + (o.roll || 0); p.stroke([[cx + s * 0.7 * W, wy], [cx + s * 0.7 * W + Math.cos(a) * 0.56 * HH, wy + Math.sin(a) * 0.56 * HH]], 1.2 * u, "#8a96a3"); } p.dot(cx + s * 0.7 * W, wy, 4 * u, "#9aa3ad"); }
  }
  // ---- legs ----
  const dress = O.skirt || O.gown;
  for (const side of [-1, 1]) {
    if (mode === "sit") {
      const h = [cx + side * 16 * u, hipY], k = [cx + side * 30 * u, torsoBot + 0.12 * HH], f = [cx + side * 30 * u, sole - 5 * u];
      p.stroke([h, k], 6.2 * u * Math.sqrt(bk), legCol); p.stroke([k, f], 6 * u * Math.sqrt(bk), dress && !O.pantsUnder ? skin : legCol);
      p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 8 * u + 3, INK); p.stroke([[f[0] - side * 3 * u, f[1]], [f[0] + side * 12 * u, f[1] + 0.5 * u]], 8 * u, shoes);
      continue;
    }
    const ph = step ? Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0))) : 0, up = Math.max(0, ph) * 26 * u, sw = ph * 10 * u;
    const hx = cx + side * 15 * u * Math.sqrt(bk), fx = cx + side * 20 * u * Math.sqrt(bk) + sw, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 6 * u * Math.sqrt(bk), dress && !O.pantsUnder ? skin : legCol);
    p.stroke([[fx - side * 4 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u + 3, INK); p.stroke([[fx - side * 4 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 8.5 * u, shoes);
    if (O.sneakers) p.stroke([[fx - side * 3 * u, fy + 2.5 * u], [fx + side * 12 * u, fy + 3 * u]], 2 * u, "#ffffff");
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const Tb = { a: (0.4 * W) / 1.06 * bk, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.build === "big" || O.build === "round" ? 0.17 : 0.1, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - Tb.b, tp = blobPts(tcx, tcy, Tb);
  const S = (side) => [tcx + side * 0.85 * Tb.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (Tb.a * 1.1 + k * u), Y0 = s[1];
    switch (pose) {
      case "point": return { pts: [s, [X(28), Y0 - 0.02 * HH], [X(62), Y0 - 0.1 * HH]], finger: true };
      case "press": return { pts: [s, [X(26), Y0 - 0.05 * HH], [X(48), Y0 - 0.32 * HH]], finger: true };
      case "up": return { pts: [s, [X(14), Y0 - 0.3 * HH], [X(22), Y0 - 0.75 * HH]] };
      case "wave": return { pts: [s, [X(16), Y0 - 0.2 * HH], [X(30 + 10 * Math.sin(o.wv || 0)), Y0 - 0.62 * HH]] };
      case "fist": return { pts: [s, [X(18), Y0 - 0.25 * HH], [X(12), Y0 - 0.66 * HH]], fist: true };
      case "hip": return { pts: [s, [X(22), Y0 + 0.3 * HH], [tcx + side * Tb.a * 0.95, torsoBot - 0.3 * HH]] };
      case "belly": return { pts: [s, [X(8), Y0 + 0.45 * HH], [tcx + side * 0.25 * Tb.a, torsoBot - 0.35 * HH]], front: true };
      case "cheek": return { pts: [s, [X(16), Y0 + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]] };
      case "chin": return { pts: [s, [X(6), Y0 + 0.3 * HH], [cx + side * 14 * u, hc + 0.85 * H.b]], front: true };
      case "mouth": return { pts: [s, [X(10), Y0 + 0.28 * HH], [cx + side * 6 * u, hc + 0.42 * H.b]], front: true };
      case "eyes": return { pts: [s, [X(10), Y0 + 0.2 * HH], [cx + side * 12 * u, hc - 0.05 * H.b]], front: true };
      case "thumb": return { pts: [s, [X(20), Y0 + 0.12 * HH], [X(44), Y0 - 0.12 * HH]], thumb: 1 };
      case "thumbdown": return { pts: [s, [X(22), Y0 + 0.05 * HH], [X(44), Y0 + 0.2 * HH]], thumb: -1 };
      case "shrug": return { pts: [s, [X(24), Y0 + 0.18 * HH], [X(46), Y0 - 0.05 * HH]], palm: true };
      case "cross": return { pts: [s, [X(2), Y0 + 0.38 * HH], [tcx - side * 0.45 * Tb.a, Y0 + 0.32 * HH]], front: true };
      case "hold": return { pts: [s, [X(10), Y0 + 0.42 * HH], [tcx + side * (Tb.a * 0.55 + 6 * u), Y0 + 0.22 * HH]], front: true };
      case "holdHi": return { pts: [s, [X(16), Y0 + 0.25 * HH], [X(10), Y0 - 0.12 * HH]] };
      case "out": return { pts: [s, [X(30), Y0 + 0.1 * HH], [X(60), Y0 + 0.02 * HH]] };
      case "reach": return { pts: [s, [X(42), Y0 - 0.12 * HH], [X(82), Y0 - 0.4 * HH]] };
      case "wrestle": { const a = o.wr ?? 0; return { pts: [s, [X(34), Y0 + 0.36 * HH], [X(40 + 30 * a), Y0 + 0.02 * HH - 38 * u * Math.cos(a * 1.2)]], fist: true }; }
      case "down": return { pts: [s, [X(14), Y0 + 0.42 * HH], [X(26), chin + 0.95 * HH]] };
      case "pace": return { pts: [s, [X(6), Y0 + 0.45 * HH], [X(6 + 10 * Math.sin(o.sw || 0)), chin + 1.0 * HH]], fist: true };
      default: return { pts: [s, [X(4), Y0 + 0.48 * HH], [X(3), chin + 1.04 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a, side) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    if (O.sleeves === "short") { const half = c.slice(0, 5); p.stroke(c, armW + 2.4 * u, INK); p.stroke(c, armW, skin); p.stroke(half, armW + 2.4 * u, INK); p.stroke(half, armW + 1 * u, sleeve);
      if (O.tattoo) { const [tx, ty] = c[7]; (side < 0 ? icon.anchor : icon.star)(p, tx, ty, 6.5 * u, "#2c5a8a"); } }
    else p.stroke(c, armW, mix(sleeve, INK, 0.35));
    const [hx, hy] = a.pts[2], hr = (O.build === "big" ? 7.5 : 5.5) * u;
    if (a.palm) { p.ell(hx, hy, hr * 1.1, hr * 0.8, skin, 2.2 * u); }
    else p.ell(hx, hy, hr, hr, skin, 2.4 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.band([[hx, hy], [hx + dx / l * 13 * u, hy + dy / l * 13 * u]], skin, 2.6 * u, 1.2 * u, "round"); }
    if (a.thumb) p.band([[hx, hy], [hx + Math.sign(hx - cx) * 2 * u, hy - a.thumb * 12 * u]], skin, 3 * u, 1.2 * u, "round");
    const held = side < 0 ? o.heldL : o.heldR;
    if (held) HELD[held.k](p, hx, hy, u, held);
  };
  for (const [i, a] of arms.entries()) if (!a.front) drawArm(a, i ? 1 : -1);
  // dress / gown skirt
  if (dress) {
    const D = { a: 0.5 * W * 0.95 * bk, b: 0.5 * ((sole - (O.gown ? 0.62 : 0.45) * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.3, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - (O.gown ? 0.62 : 0.45) * HH - D.b, D), dc = O.gown || O.skirt;
    p.gradFill(dp, dc, mul(dc, SH_CLOTH), light); if (O.gown) p.clip(dp, () => { for (let i = 0; i < 14; i++) p.dot(cx - D.a + (i % 5) * D.a * 0.5 + (i % 2) * 12 * u, tcy + Math.floor(i / 5) * 0.4 * HH, 3 * u, "#ffffff88"); }); p.inkRing(dp, ow, thick);
  } else if (mode !== "sit") { // trouser top
    const sk = [[tcx - 0.9 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.9 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.95 * Tb.a, torsoBot + 0.22 * HH], [tcx - 0.95 * Tb.a, torsoBot + 0.22 * HH]];
    p.gradFill(sk, pants, mul(pants, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.stripes) p.clip(sk, () => { for (let i = 0; i < 4; i++) p.poly([[tcx - Tb.a * 1.2, torsoBot - 0.2 * HH + i * 0.12 * HH], [tcx + Tb.a * 1.2, torsoBot - 0.2 * HH + i * 0.12 * HH], [tcx + Tb.a * 1.2, torsoBot - 0.14 * HH + i * 0.12 * HH], [tcx - Tb.a * 1.2, torsoBot - 0.14 * HH + i * 0.12 * HH]], O.stripes, 0); });
  } else { // lap
    const lp = [[tcx - 0.95 * Tb.a, torsoBot - 0.2 * HH], [tcx + 0.95 * Tb.a, torsoBot - 0.2 * HH], [tcx + 1.0 * Tb.a, torsoBot + 0.16 * HH], [tcx - 1.0 * Tb.a, torsoBot + 0.16 * HH]];
    const lc = O.gown || O.skirt || pants; p.gradFill(lp, lc, mul(lc, SH_CLOTH), light); p.poly(lp, null, ow * 0.8);
  }
  // torso
  p.gradFill(tp, top, mul(top, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.stripes) for (let i = 0; i < 7; i++) { const y0 = chin - 0.05 * HH + i * 0.16 * HH; p.poly([[tcx - 2 * Tb.a, y0], [tcx + 2 * Tb.a, y0], [tcx + 2 * Tb.a, y0 + 0.07 * HH], [tcx - 2 * Tb.a, y0 + 0.07 * HH]], O.stripes, 0); }
    if (O.jersey) { p.poly([[tcx - 2 * Tb.a, tcy - 0.05 * HH], [tcx + 2 * Tb.a, tcy - 0.05 * HH], [tcx + 2 * Tb.a, tcy + 0.06 * HH], [tcx - 2 * Tb.a, tcy + 0.06 * HH]], O.jersey, 0); }
    if (O.coat || O.cardigan) { const cc = O.coat || O.cardigan; for (const s of [-1, 1]) p.poly([[tcx + s * 2 * Tb.a, chin - 0.2 * HH], [tcx + s * 0.18 * Tb.a, chin - 0.2 * HH], [tcx + s * 0.3 * Tb.a, torsoBot + 0.2 * HH], [tcx + s * 2 * Tb.a, torsoBot + 0.2 * HH]], mixc(cc, "#ffffff", 0), 0);
      p.stroke([[tcx - 0.18 * Tb.a, chin - 0.1 * HH], [tcx - 0.3 * Tb.a, torsoBot + 0.2 * HH]], 2 * u); p.stroke([[tcx + 0.18 * Tb.a, chin - 0.1 * HH], [tcx + 0.3 * Tb.a, torsoBot + 0.2 * HH]], 2 * u);
      if (O.coat) p.poly(rrect(tcx + 0.4 * Tb.a, tcy - 0.05 * HH, tcx + 0.8 * Tb.a, tcy + 0.15 * HH, 3 * u), mul(O.coat, [0.92, 0.94, 0.97]), 1.6 * u);
      if (O.cardigan) for (let i = 0; i < 3; i++) p.dot(tcx - 0.24 * Tb.a, chin + (0.15 + i * 0.22) * HH, 2.6 * u, "#6b4a1e"); }
    if (O.apron) p.poly([[tcx - 0.62 * Tb.a, chin + 0.1 * HH], [tcx + 0.62 * Tb.a, chin + 0.1 * HH], [tcx + 0.7 * Tb.a, torsoBot + 0.25 * HH], [tcx - 0.7 * Tb.a, torsoBot + 0.25 * HH]], O.apron, 1.8 * u);
    if (O.uniform) { p.band([[tcx - 1.4 * Tb.a, torsoBot - 0.22 * HH], [tcx + 1.4 * Tb.a, torsoBot - 0.22 * HH]], "#2a2a2a", 0.07 * HH, 1.2 * u); p.poly(rrect(tcx - 6 * u, torsoBot - 0.26 * HH, tcx + 6 * u, torsoBot - 0.18 * HH, 1.5 * u), "#e2c27a", 1.2 * u);
      for (let i = 0; i < 3; i++) p.dot(tcx, chin + (0.15 + i * 0.2) * HH, 2.4 * u, "#e2c27a"); icon.star(p, tcx + 0.5 * Tb.a, chin + 0.25 * HH, 6 * u, "#e2c27a", 1.2 * u); }
    if (O.fireCoat) { for (const yy of [0.35, 0.75]) p.band([[tcx - 1.4 * Tb.a, chin + yy * HH], [tcx + 1.4 * Tb.a, chin + yy * HH]], "#f3e04a", 0.05 * HH, 1 * u); p.band([[tcx - 1.4 * Tb.a, chin + 0.55 * HH], [tcx + 1.4 * Tb.a, chin + 0.55 * HH]], "#d9dde0", 0.03 * HH, 0.8 * u); }
    p.stroke([[tcx - 0.2 * Tb.a, chin + 0.02 * HH], [tcx, chin + 0.14 * HH], [tcx + 0.2 * Tb.a, chin + 0.02 * HH]], 2 * u);
  });
  p.inkRing(tp, ow, thick);
  if (O.bowtie) { const by = chin + 0.06 * HH; p.poly([[tcx, by], [tcx - 13 * u, by - 7 * u], [tcx - 13 * u, by + 7 * u]], O.bowtie, 1.6 * u); p.poly([[tcx, by], [tcx + 13 * u, by - 7 * u], [tcx + 13 * u, by + 7 * u]], O.bowtie, 1.6 * u); p.dot(tcx, by, 3.2 * u, mul(O.bowtie, [0.7, 0.7, 0.7])); }
  if (O.tie) p.poly([[tcx - 4 * u, chin + 0.04 * HH], [tcx + 4 * u, chin + 0.04 * HH], [tcx + 6 * u, chin + 0.45 * HH], [tcx, chin + 0.52 * HH], [tcx - 6 * u, chin + 0.45 * HH]], O.tie, 1.6 * u);
  if (O.electrode) { const a = arms[1].pts; const [ex, ey] = lerp2(a[1], a[2], 0.7); p.poly(rrect(ex - 7 * u, ey - 4 * u, ex + 7 * u, ey + 4 * u, 2 * u), "#3a3f4a", 1.4 * u); p.stroke([[ex, ey], [ex + 20 * u, ey + 40 * u], [ex + 10 * u, ey + 80 * u]], 1.4 * u, "#d23c3c"); }
  for (const [i, a] of arms.entries()) if (a.front) drawArm(a, i ? 1 : -1);
  if (O.wheelchair) for (const s of [-1, 1]) { const wy = sole - 0.62 * HH; p.arc(cx + s * 0.7 * W, wy, 0.62 * HH, 0.62 * HH, s > 0 ? -60 : 120, s > 0 ? 60 : 240, 5 * u, "#2c3e50"); }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  const hp = blobPts(cx, hc, H);
  if (O.long) { const hb = blobPts(cx, hc + 0.18 * HH, { ...H, a: H.a * 1.12, b: H.b * 1.18, egg: 0.1 }); p.poly(hb, O.hair, 3 * u); }
  if (O.hair && O.hat !== "fire") { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: top }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair && !O.hat) hatOn(p, { hat: "hair", hair: O.hair, jacket: top }, hp, H, cx, hc, light, seed, facing, false);
  if (O.bun) { p.ell(cx, hc - 1.05 * H.b, 0.32 * H.a, 0.26 * H.b, O.hair, 3 * u); }
  if (O.bald) for (const s of [-1, 1]) p.ell(cx + s * 0.92 * H.a, hc - 0.05 * H.b, 0.16 * H.a, 0.28 * H.b, O.bald, 2.4 * u);
  if (O.beard) { const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.62 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 }); p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3); p.inkRing(bd, ow * 0.8, thick); }
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.moustache, O.build === "big");
  if (O.glasses) for (const s of [-1, 1]) { p.ell(cx + 7 * u * facing + s * 13 * u, hc, 10.5 * u, 9.5 * u, "#ffffff30", 2.6 * u); if (s < 0) p.stroke([[cx + 7 * u * facing - 3 * u, hc - 1 * u], [cx + 7 * u * facing + 3 * u, hc - 1 * u]], 2.4 * u); }
  if (O.hat === "guard") { const cy0 = hc - 0.72 * H.b; p.poly([[cx - 0.98 * H.a, cy0 + 8 * u], [cx + 0.98 * H.a, cy0 + 8 * u], [cx + 1.08 * H.a, cy0 - 30 * u], [cx - 1.08 * H.a, cy0 - 30 * u]], "#2c3a5e", ow * 0.8); p.poly([[cx - 0.98 * H.a, cy0 + 2 * u], [cx + 0.98 * H.a, cy0 + 2 * u], [cx + 0.98 * H.a, cy0 + 10 * u], [cx - 0.98 * H.a, cy0 + 10 * u]], "#1b2238", 1.6 * u); p.ell(cx, cy0 + 14 * u, 0.85 * H.a, 9 * u, "#1b2238", 2 * u, 0, 180); icon.star(p, cx, cy0 - 12 * u, 8 * u, "#e2c27a", 1.2 * u); }
  if (O.hat === "nurse") { const cy0 = hc - 0.85 * H.b; p.poly([[cx - 0.6 * H.a, cy0 + 6 * u], [cx + 0.6 * H.a, cy0 + 6 * u], [cx + 0.5 * H.a, cy0 - 20 * u], [cx - 0.5 * H.a, cy0 - 20 * u]], "#ffffff", 2.4 * u); icon.heart(p, cx, cy0 - 7 * u, 7 * u); }
  if (O.hat === "fire") { const cy0 = hc - 0.38 * H.b; const hp2 = ellPts(cx, cy0, H.a * 1.06, H.b * 0.78, 180, 360, 0, 40); p.shadedFill(hp2, "#d8322c", "#9a1e1e", light, H.a); p.inkRing(hp2, ow, thick); p.ell(cx, cy0 + 2 * u, H.a * 1.45, 10 * u, "#c12a26", ow * 0.8); p.poly(rrect(cx - 10 * u, cy0 - H.b * 0.7, cx + 10 * u, cy0 - 6 * u, 4 * u), "#b7242a", 1.8 * u); p.stroke(ellPts(cx - 0.4 * H.a, cy0 - 0.45 * H.b, 0.2 * H.a, 0.15 * H.b, 200, 300, 0, 12), 4 * u, "#ffffff66"); }
  if (O.hat === "chef") {}
  p.rot = null;
};

// ---------- the Brain host ----------
const brainOutline = (cx, cy, rx, ry) => { const pts = []; const n = 120; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; const b = 1 + 0.035 * Math.abs(Math.sin(t * 6.5)) + 0.012 * Math.sin(t * 13); pts.push([cx + Math.cos(t) * rx * b, cy + Math.sin(t) * ry * b * (Math.sin(t) > 0 ? 0.92 : 1)]); } return pts; };
const GYRI = [ // squiggles in unit brain space (x,y in -1..1)
  [[-0.78, -0.1], [-0.6, -0.35], [-0.38, -0.25], [-0.32, -0.52], [-0.12, -0.62]], [[0.78, -0.1], [0.6, -0.35], [0.38, -0.25], [0.32, -0.52], [0.12, -0.62]],
  [[-0.88, 0.2], [-0.72, 0.05], [-0.62, 0.22]], [[0.88, 0.2], [0.72, 0.05], [0.62, 0.22]],
  [[-0.55, -0.72], [-0.42, -0.58], [-0.6, -0.5]], [[0.55, -0.72], [0.42, -0.58], [0.6, -0.5]],
  [[-0.7, 0.55], [-0.5, 0.48], [-0.42, 0.66]], [[0.7, 0.55], [0.5, 0.48], [0.42, 0.66]],
];
const BEXPR = {
  neutral: { eye: "open", brow: [0, 0], mouth: "smile" }, happy: { eye: "happy", brow: [-6, -6], mouth: "grin" }, wow: { eye: "wide", brow: [-16, -16], mouth: "O" },
  smug: { eye: "half", brow: [-4, -18], mouth: "smirk" }, worried: { eye: "open", brow: [8, -6], mouth: "wave" }, sly: { eye: "sly", brow: [6, -6], mouth: "smirk" },
  closed: { eye: "closed", brow: [-2, -2], mouth: "smile" }, ouch: { eye: "squeeze", brow: [8, 8], mouth: "wave" }, excited: { eye: "wide", brow: [-12, -12], mouth: "grin" },
  shrug: { eye: "half", brow: [-10, -10], mouth: "flat" }, curious: { eye: "open", brow: [-12, 2], mouth: "o" }, oops: { eye: "squeeze", brow: [6, 6], mouth: "grin" },
};
export const brain = (p, o = {}) => {
  const { expr = "neutral", blink = 0, look = [0, 0], L = "hang", R = "hang", legs = "stand", step = 0, shadow = false, wv = 0, wheel = null, wineGlasses = false, sitting = false } = o;
  const E = BEXPR[expr] || BEXPR.neutral, cx = 300, sole = 975, legL = legs === "jump" ? 70 : legs === "sit" ? 70 : 120, bcy = sole - legL - 205, rx = 230, ry = 200, u = 2.4;
  const body = shadow ? "#3a2b57" : PINK, dark = shadow ? "#251a3b" : PINK_D, inkC = shadow ? "#120c1e" : INK;
  const light = rad(-125), thick = thickAngle(light);
  const limb = (pts, w, col) => { p.stroke(pts, w + 7, inkC); p.stroke(pts, w, col); };
  // legs + sneakers
  for (const s of [-1, 1]) {
    const hx = cx + s * 70, hy = bcy + ry * 0.85;
    let kx = hx + s * 6, ky = hy + legL * 0.5, fx = hx + s * 10, fy = sole - 18;
    if (legs === "jump") { kx = hx + s * 40; ky = hy + 30; fx = hx + s * 18; fy = hy + 62; }
    if (legs === "walk") { const ph = Math.sin(Math.PI * 2 * (step + (s > 0 ? 0.5 : 0))); fx += ph * 22; fy -= Math.max(0, ph) * 24; kx += ph * 10; }
    if (legs === "sit") { kx = hx + s * 30; ky = hy + 20; fx = hx + s * 52; fy = hy + 60; }
    limb(curve([hx, hy], [kx, ky], [fx, fy]), 18, body);
    if (!shadow) { const sh = [[fx - s * 34, fy - 10], [fx - s * 30, fy - 30], [fx + s * 12, fy - 32], [fx + s * 44, fy - 8], [fx + s * 46, fy + 10], [fx - s * 36, fy + 12]]; p.poly(sh, "#ffffff", 7); p.stroke([[fx - s * 34, fy + 4], [fx + s * 44, fy + 4]], 6, "#cfd6de"); p.stroke([[fx - s * 14, fy - 20], [fx + s * 20, fy - 6]], 7, "#36c2c9"); }
    else p.ell(fx + s * 6, fy - 6, 40, 18, dark, 0);
  }
  // arms (behind / front)
  const sh = (s) => [cx + s * rx * 0.86, bcy + ry * 0.32];
  const armP = (s, pose) => { const [sx, sy] = sh(s); switch (pose) {
    case "wave": return [[sx, sy], [sx + s * 60, sy - 40], [sx + s * (90 + 20 * Math.sin(wv)), sy - 150]];
    case "up": return [[sx, sy], [sx + s * 50, sy - 70], [sx + s * 60, sy - 190]];
    case "knock": return [[sx, sy], [sx + s * 40, sy - 160], [cx + s * 80, bcy - ry * 0.98 - 10 * (o.kn || 0)]];
    case "sign": return [[sx, sy], [sx + s * 10, sy - 30], [cx + s * 70, sy - 40]];
    case "throw": return [[sx, sy], [sx + s * 30, sy - 120], [sx + s * 10 + s * 40 * (o.th || 0), sy - 220 + 60 * (o.th || 0)]];
    case "shrug": return [[sx, sy], [sx + s * 70, sy + 20], [sx + s * 120, sy - 50]];
    case "facepalm": return [[sx, sy], [sx - s * 10, sy + 40], [cx + s * 20, bcy + 10]];
    case "wheel": return [[sx, sy], [sx - s * 20, sy + 60], [cx + s * 95 * Math.cos(o.wa || 0) - 95 * Math.sin(o.wa || 0) * 0, bcy + ry * 0.62 + s * 0]];
    case "hold": return [[sx, sy], [sx + s * 60, sy - 50], [sx + s * 80, sy - 130]];
    case "point": return [[sx, sy], [sx + s * 70, sy - 20], [sx + s * 140, sy - 50]];
    case "chin": return [[sx, sy], [sx + s * 10, sy + 70], [cx + s * 40, bcy + ry * 0.6]];
    case "thumb": return [[sx, sy], [sx + s * 60, sy + 10], [sx + s * 100, sy - 40]];
    case "rest": return [[sx, sy], [sx + s * 60, sy + 60], [sx + s * 110, sy + 70]];
    case "glasses": return [[sx, sy], [sx + s * 30, sy - 60], [cx + s * 150, bcy - 10]];
    default: return [[sx, sy], [sx + s * 30, sy + 60], [sx + s * 30, sy + 130]];
  } };
  const front = (pose) => pose === "facepalm" || pose === "wheel" || pose === "chin" || pose === "sign";
  const hand = (x, y, pose, s) => { if (shadow) { p.ell(x, y, 26, 26, dark, 0); return; } p.ell(x, y, 27, 25, "#ffffff", 6); if (pose === "thumb") p.band([[x, y], [x, y - 32]], "#ffffff", 14, 4, "round"); p.stroke([[x - 6 * s, y + 4], [x + 8 * s, y + 4]], 3, "#cfd6de"); };
  for (const [s, pose] of [[-1, L], [1, R]]) if (!front(pose)) { const a = armP(s, pose); limb(curve(a[0], a[1], a[2]), 15, body); hand(a[2][0], a[2][1], pose, s); }
  // body
  const bp = brainOutline(cx, bcy, rx, ry);
  if (shadow) { p.poly(bp, body, 0); p.inkRing(bp, 10, thick, 0.45, inkC); }
  else {
    p.shadedFill(bp, body, PINK_D, light, rx, 0.45, 0.95, 1.3);
    p.clip(bp, () => {
      for (const g of GYRI) { const pts = g.map(([x, y]) => [cx + x * rx, bcy + y * ry]); p.stroke(curve(pts[0], pts[Math.floor(pts.length / 2)], pts[pts.length - 1], 14), 9, dark); }
      p.stroke(curve([cx, bcy - ry * 1.05], [cx - 14, bcy - ry * 0.75], [cx + 4, bcy - ry * 0.5], 12), 10, dark);
      p.ell(cx - rx * 0.45, bcy - ry * 0.62, rx * 0.22, ry * 0.1, PINK_L + "aa", 0, 0, 360, -20);
    });
    p.inkRing(bp, 10, thick);
  }
  // face
  const ex = 72, ey = bcy + 10, erx = E.eye === "wide" ? 56 : 50, ery = E.eye === "wide" ? 66 : 60, lid = lidOf(blink);
  for (const s of [-1, 1]) {
    const x = cx + s * ex, y = ey;
    if (shadow) { // sly glowing slits
      p.ell(x, y, erx * 0.95, 16, "#ffd84a", 0, 0, 360, s * -12); p.dot(x + 14, y, 9, "#120c1e");
    } else if (E.eye === "happy" || E.eye === "closed" || lid >= 1) { p.arc(x, y + (E.eye === "happy" ? 12 : 0), erx * 0.7, ery * 0.45, E.eye === "happy" ? 200 : 20, E.eye === "happy" ? 340 : 160, 10); }
    else if (E.eye === "squeeze") { p.stroke([[x - s * 34, y - 22], [x + s * 26, y], [x - s * 34, y + 22]], 10); }
    else {
      p.ell(x, y, erx, ery, "#ffffff", 8);
      const pr = E.eye === "wide" ? 20 : 28, px = x + look[0] * 18 + (E.eye === "sly" ? 18 : 0), py = y + 8 + look[1] * 16;
      p.clip(ellPts(x, y, erx, ery), () => { p.dot(px, py, pr, "#2b1d33"); p.dot(px, py, pr * 0.55, "#5a3b7a"); p.dot(px - pr * 0.45, py - pr * 0.45, pr * 0.32, "#ffffff"); p.dot(px + pr * 0.35, py + pr * 0.35, pr * 0.14, "#ffffff");
        const lidY = E.eye === "half" || E.eye === "sly" ? 0.42 : lid > 0 ? 0.55 : 0;
        if (lidY) p.poly([[x - erx * 1.2, y - ery * 1.2], [x + erx * 1.2, y - ery * 1.2], [x + erx * 1.2, y - ery + ery * 2 * lidY], [x - erx * 1.2, y - ery + ery * 2 * lidY]], PINK, 0); });
      p.ell(x, y, erx, ery, null, 8);
      if (E.eye === "half" || E.eye === "sly" || lid > 0) p.stroke([[x - erx * 0.98, y - ery + ery * 2 * (E.eye === "half" || E.eye === "sly" ? 0.42 : 0.55)], [x + erx * 0.98, y - ery + ery * 2 * (E.eye === "half" || E.eye === "sly" ? 0.42 : 0.55)]], 8);
    }
    // brows
    if (!shadow) { const [dI, dO] = E.brow, by = y - ery - 26, bo = s > 0 ? (o.browR ?? 0) : (o.browL ?? 0); p.band([[x - s * 34, by + dI + bo], [x + s * 30, by + dO + bo]], "#8c3556", 12, 4, "round"); }
  }
  if (!shadow) for (const s of [-1, 1]) p.ell(cx + s * 140, ey + 62, 26, 14, "#ff7fa3aa", 0);
  // mouth
  const mx = cx, my = ey + 92, M = shadow ? "smirk" : E.mouth;
  if (M === "smile") p.arc(mx, my - 14, 34, 22, 20, 160, 9);
  else if (M === "grin") { const mp = [...ellPts(mx, my - 10, 44, 38, 0, 180, 0, 20)]; mp.unshift([mx - 44, my - 10]); p.poly(mp, "#7a2440", 7); p.clip(mp, () => p.ell(mx, my + 26, 26, 16, "#ff8aa5", 0)); }
  else if (M === "O") p.ell(mx, my + 2, 22, 28, "#7a2440", 7);
  else if (M === "o") p.ell(mx, my, 12, 14, "#7a2440", 6);
  else if (M === "smirk") p.stroke(curve([mx - 30, my - 2], [mx + 4, my + 6], [mx + 34, my - 14]), shadow ? 8 : 9, shadow ? "#ffd84a" : INK);
  else if (M === "wave") p.stroke([[mx - 32, my], [mx - 16, my - 8], [mx, my], [mx + 16, my - 8], [mx + 32, my]], 8);
  else if (M === "flat") p.stroke([[mx - 26, my], [mx + 26, my]], 8);
  else if (M === "frown") p.arc(mx, my + 14, 30, 18, 200, 340, 9);
  // front arms
  for (const [s, pose] of [[-1, L], [1, R]]) if (front(pose)) { const a = armP(s, pose); limb(curve(a[0], a[1], a[2]), 15, body); hand(a[2][0], a[2][1], pose, s); }
  if (wheel !== null) { const wy = bcy + ry * 0.62, wr = 110, a = o.wa || 0; p.ell(cx, wy, wr, wr, null, 26); p.ell(cx, wy, wr, wr, null, 0); p.arc(cx, wy, wr, wr, 0, 360, 16, "#e74c3c"); for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3 + Math.PI / 2; p.band([[cx, wy], [cx + Math.cos(aa) * wr, wy + Math.sin(aa) * wr]], "#f1c40f", 12, 4); } p.ell(cx, wy, 26, 26, "#3498db", 6); for (const s of [-1, 1]) { const aa = a + (s < 0 ? Math.PI : 0); hand(cx + Math.cos(aa) * wr, wy + Math.sin(aa) * wr, "", s); } }
  if (wineGlasses) for (const s of [-1, 1]) { const x = cx + s * ex, y = ey; p.ell(x, y, 66, 66, "#ffffff22", 9); p.ell(x, y, 66, 66, null, 4); p.stroke([[x, y + 66], [x + s * 6, y + 150]], 9); p.stroke([[x - 26, y + 150], [x + 30, y + 150]], 9); p.stroke([[x - 40 * s, y - 34], [x - 26 * s, y + 4]], 7, "#ffffffcc"); }
};

// ---------- round sign with dots ----------
export const dotSign = (p, n, cx = 300, cy = 420, r = 230) => {
  p.band([[cx, cy + r * 0.8], [cx, cy + r + 230]], "#c9935a", 26, 7);
  p.ell(cx, cy + 10, r, r, "#1b6f7a", 0);
  p.ell(cx, cy, r, r, "#fff3d6", 14); p.ell(cx, cy, r * 0.86, r * 0.86, null, 6); p.arc(cx, cy, r * 0.93, r * 0.93, 0, 360, 14, "#36c2c9");
  const pos = { 1: [[0, 0]], 2: [[-0.35, 0], [0.35, 0]], 3: [[0, -0.32], [-0.36, 0.26], [0.36, 0.26]], 4: [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]], 5: [[-0.38, -0.38], [0.38, -0.38], [0, 0], [-0.38, 0.38], [0.38, 0.38]] }[n];
  for (const [dx, dy] of pos) { p.ell(cx + dx * r, cy + dy * r, r * 0.17, r * 0.17, PINK, 9); p.dot(cx + dx * r - r * 0.05, cy + dy * r - r * 0.05, r * 0.05, "#ffffff"); }
};

// ---------- props (drawn around the origin; story places them in centred cards) ----------
export const PROP = {
  roller: (p, k = 0) => { // giant paint roller (tilted, pink nap)
    p.band([[0, 340], [0, 40]], "#8a5a34", 26, 7, "round"); p.stroke([[0, 40], [0, -60], [-180, -60], [-180, -110]], 22); p.stroke([[0, 40], [0, -60], [-180, -60], [-180, -110]], 12, "#c7ccd2");
    p.poly(rrect(-330, -230, -30, -110, 50), "#f48fb1", 10); p.clip(rrect(-330, -230, -30, -110, 50), () => { for (let i = 0; i < 14; i++) p.stroke([[-330 + i * 24 + k * 30 % 24, -230], [-322 + i * 24 + k * 30 % 24, -110]], 5, "#e0709a"); });
    for (let i = 0; i < 4; i++) p.ell(-280 + i * 70, -95 + (i % 2) * 18, 9, 14, "#f48fb1", 4);
  },
  can: (p, pour = 0) => { // small red paint can, tilts to pour
    p.g.save(); p.g.rotate(-pour * 1.6);
    p.poly(rrect(-90, -110, 90, 110, 16), "#e6e9ee", 9); p.poly(rrect(-90, -60, 90, 50, 4), "#d32f2f", 6); p.ell(0, -110, 90, 20, "#c4c9cf", 7); p.ell(-10, -110, 70, 14, "#c0171a", 0); icon.heart(p, 0, -5, 40, "#ffffff");
    p.arc(0, -110, 100, 70, 180, 360, 8, "#5a6470");
    p.g.restore();
    if (pour > 0.55) { const k = (pour - 0.55) / 0.45; p.stroke([[-160, -40], [-175, 60 + 300 * k]], 26 * Math.min(1, k * 3), "#c0171a"); }
  },
  stick: (p) => { p.poly(rrect(-24, -360, 24, 300, 18), "#d9b47a", 8); p.clip(rrect(-24, -360, 24, 300, 18), () => p.poly([[-30, 120], [30, 120], [30, 300], [-30, 300]], "#f48fb1", 0)); for (let i = 0; i < 4; i++) p.stroke([[-10, -300 + i * 90], [8, -260 + i * 90]], 4, "#b38a52"); },
  wineGlass: (p, col = "#f3e6a2", lv = 0.55, cloud = 0, cloudCol = "#c0171a", seed = 1) => {
    const bw = 170, bh = 230, by = -150;
    const bowl = [[bw, by - 150], ...ellPts(0, by, bw, bh, 0, 180, 0, 40), [-bw, by - 150]];
    const top = by - 150 + (1 - lv) * (bh + 150);
    p.clip(bowl, () => { p.poly([[-bw, top], [bw, top], [bw, by + bh + 10], [-bw, by + bh + 10]], col, 0);
      if (cloud > 0) { for (let i = 0; i < 9; i++) { const a = i * 2.39 + seed, d = cloud * 90 * ((i % 3) / 2 + 0.4); p.ell(Math.cos(a) * d, top + 30 + cloud * 100 + Math.sin(a) * d * 0.7, 30 + cloud * 70, 24 + cloud * 60, cloudCol + (cloud > 0.8 ? "" : "cc"), 0); } }
      p.ell(0, top, bw, 16, mixc(col, "#ffffff", 0.35), 4); });
    p.poly(bowl, "#ffffff18", 9); p.stroke([[-bw * 0.62, by - 100], [-bw * 0.7, by + 80]], 14, "#ffffffcc"); p.dot(bw * 0.55, by - 120, 9, "#ffffffcc");
    p.band([[0, by + bh], [0, 330]], "#eef4f7", 14, 5); p.ell(0, 340, 120, 22, "#eef4f7", 7);
  },
  bottle: (p, kind = "fancy", fill = 0.7) => {
    const body = rrect(-95, -120, 95, 360, 40);
    const neck = [[-36, -120], [-36, -300], [36, -300], [36, -120]];
    if (kind === "fancy") {
      p.poly([[-95, -100], [-36, -200], [-36, -330], [36, -330], [36, -200], [95, -100]], "#203a2a", 0);
      p.poly(body, "#1d3b2a", 9); p.poly(neck, "#1d3b2a", 8); p.poly([[-40, -330], [40, -330], [44, -230], [-44, -230]], "#e6b84a", 7);
      p.clip([[-40, -330], [40, -330], [44, -230], [-44, -230]], () => { for (let i = 0; i < 5; i++) p.stroke([[-50, -320 + i * 22], [50, -310 + i * 22]], 4, "#c99a2e"); });
      p.ell(0, -205, 40, 34, "#a61e2b", 6); p.ell(-10, -214, 12, 8, "#d8505c", 0);
      p.poly(rrect(-78, 40, 78, 250, 12), "#f6edd6", 7); p.poly(rrect(-66, 52, 66, 238, 8), null, 4); icon.crest(p, 0, 120, 60); icon.lines(p, 0, 200, 90, 2, 16, "#c9a75a", 6);
      p.stroke([[-70, -60], [-70, 10]], 12, "#ffffff44");
      for (let i = 0; i < 4; i++) icon.sparkle(p, -120 + i * 80, -260 + (i % 2) * 120, 14 + (i % 2) * 8, "#fff6c4");
    } else if (kind === "white") {
      p.poly(rrect(-85, -100, 85, 360, 22), "#cfe3b8", 8); p.poly([[-30, -100], [-30, -280], [30, -280], [30, -100]], "#cfe3b8", 7); p.poly(rrect(-34, -320, 34, -270, 6), "#e8d9b0", 6);
      p.clip(rrect(-85, -100, 85, 360, 22), () => p.poly([[-90, -40], [90, -40], [90, 370], [-90, 370]], "#efe2a0", 0)); p.poly(rrect(-85, -100, 85, 360, 22), null, 8);
      p.poly(rrect(-66, 70, 66, 210, 6), "#ffffff", 5); icon.grape(p, 0, 140, 80, "#9cc25a"); p.stroke([[-60, -40], [-60, 20]], 10, "#ffffff66");
    } else {
      p.poly(rrect(-85, -100, 85, 360, 22), "#7fae5a", 8); p.poly([[-30, -100], [-30, -270], [30, -270], [30, -100]], "#7fae5a", 7); p.poly(rrect(-34, -310, 34, -262, 6), "#b5bcc4", 6);
      for (let i = 0; i < 3; i++) p.stroke([[-34, -298 + i * 14], [34, -298 + i * 14]], 3, "#8a9299");
      p.poly(rrect(-70, 80, 70, 200, 4), "#ffffff", 5); icon.tag(p, 0, 140, 34, "#e04545");
      p.stroke([[-60, -40], [-60, 20]], 10, "#ffffff44");
    }
  },
  pillHalf: (p, k = 0) => { // capsule breaks open, sparkly sugar dust pours out
    const a = k * 0.9, d = k * 70;
    for (const s of [-1, 1]) { p.g.save(); p.g.translate(s * d, -k * 30); p.g.rotate(s * a);
      const pts = s < 0 ? [[-200, -70], [0, -70], [0, 70], [-200, 70]] : [[0, -70], [200, -70], [200, 70], [0, 70]];
      p.clip(pts, () => p.poly(rrect(-200, -70, 200, 70, 70), s < 0 ? "#ffffff" : "#f6f8fb", 9)); p.stroke([[0, -70], [0, 70]], 8); if (k > 0.05) p.ell(0, 0, 10, 62, "#e9edf2", 5);
      p.g.restore(); }
    if (k > 0.15) for (let i = 0; i < 26; i++) { const t = (i * 0.137 + k * 1.3) % 1, x = Math.sin(i * 3.7) * 60 * t, y = 20 + t * 260; icon.sparkle(p, x, y, 6 + (i % 4) * 4, i % 3 ? "#fff6c4" : "#ffd1e3"); }
  },
  hourglass: (p, k = 0.5) => {
    p.poly(rrect(-150, -300, 150, -260, 12), "#8a5a34", 8); p.poly(rrect(-150, 260, 150, 300, 12), "#8a5a34", 8);
    for (const s of [-1, 1]) p.band([[s * 130, -260], [s * 130, 260]], "#a87444", 18, 6);
    const glass = [[-100, -260], [100, -260], [100, -200], [16, -10], [16, 10], [100, 200], [100, 260], [-100, 260], [-100, 200], [-16, 10], [-16, -10], [-100, -200]];
    p.poly(glass, "#e8f6ff88", 0);
    const top = 1 - k; p.clip(glass, () => { p.poly([[-100, -200 + 190 * (1 - top)], [100, -200 + 190 * (1 - top)], [16, -10], [-16, -10]], "#f2c76a", 0); p.poly([[-100, 260], [100, 260], [100, 260 - 180 * k], [0, 260 - 230 * k], [-100, 260 - 180 * k]], "#f2c76a", 0); p.stroke([[0, -10], [0, 255]], 6, "#f2c76a"); });
    p.poly(glass, null, 8); p.stroke([[-70, -230], [-70, -190]], 10, "#ffffffaa");
  },
  clock: (p, t = 0) => { // wall clock: no numbers, only dots + hands
    p.ell(0, 0, 230, 230, "#f4f1ea", 14); p.ell(0, 0, 200, 200, null, 5);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; p.dot(Math.cos(a) * 170, Math.sin(a) * 170, i % 3 ? 9 : 16); }
    const h = t * Math.PI * 2 / 12 - Math.PI / 2, m = t * Math.PI * 2 - Math.PI / 2;
    p.band([[0, 0], [Math.cos(h) * 100, Math.sin(h) * 100]], "#2b2b33", 18, 3, "round"); p.band([[0, 0], [Math.cos(m) * 155, Math.sin(m) * 155]], "#2b2b33", 11, 3, "round"); p.dot(0, 0, 18, "#d23c3c");
  },
  stopwatch: (p, t = 0) => { HELD.stopwatch(p, 0, 0, 10, { t, nohand: 1 }); },
  folder: (p, ic = "tree", long = false) => { p.poly([[-300, -200], [-120, -200], [-90, -240], [300, -240], [300, 220], [-300, 220]], "#e8c26a", 10); p.poly([[-270, -180], [270, -180], [270, 200], [-270, 200]], "#fbfbf6", 6);
    if (ic === "tree") icon.tree(p, -160, -50, 170); else icon.brick(p, -160, -60, 150);
    icon.lines(p, 110, -120, 230, 3, 44, "#b9b9c2", 12);
    const n = long ? 7 : 2; for (let i = 0; i < n; i++) icon.pill(p, -200 + i * 66, 120, 26, i % 2 ? "#ffd1e3" : "#ffffff");
  },
  brochure: (p, kind = "rich") => { HELD.brochure(p, 0, 0, 9, { kind, nohand: 1 }); },
  smileChart: (p, nA = 9, nB = 4, k = 1) => {
    p.poly(rrect(-760, -300, 760, 300, 30), "#ffffff", 10);
    p.poly(rrect(-740, -260, -620, -60, 16), "#1f2d5c", 6); icon.coinStack(p, -680, -130, 34, 3);
    p.poly(rrect(-740, 60, -620, 260, 16), "#f1efe6", 6); icon.tag(p, -680, 160, 40);
    for (let i = 0; i < Math.round(nA * k); i++) icon.smile(p, -540 + i * 140, -160, 54, "#ffd23f");
    for (let i = 0; i < Math.round(nB * k); i++) icon.smile(p, -540 + i * 140, 160, 54, "#ffd23f");
    p.stroke([[-760, 0], [760, 0]], 6, "#d8d8e0");
  },
  priceTag: (p, side = 1) => { const pts = [[-200, -130], [140, -130], [230, 0], [140, 130], [-200, 130]]; p.poly(pts, side > 0 ? "#f2c14e" : "#e04545", 12); p.ell(150, 0, 24, 24, "#fff", 7); p.stroke([[174, 0], [260, -60], [300, -150]], 7, "#7a5434");
    if (side > 0) icon.coinStack(p, -40, 40, 60, 4); else icon.coin(p, -40, 0, 50); },
  gauge: (p, v = 1) => { // v: 1 = red (pain), 0 = green
    p.poly(rrect(-70, -330, 70, 330, 70), "#ffffff", 10);
    const g = p.g, gr = g.createLinearGradient(0, -300, 0, 300); gr.addColorStop(0, "#e53935"); gr.addColorStop(0.5, "#fbc02d"); gr.addColorStop(1, "#43a047");
    p.clip(rrect(-46, -306, 46, 306, 46), () => { g.fillStyle = "#e8e8ee"; g.fillRect(-60, -320, 120, 640); const top = 300 - 600 * v; g.fillStyle = gr; g.fillRect(-60, top, 120, 320 - top); });
    p.poly(rrect(-46, -306, 46, 306, 46), null, 6);
    const y = 300 - 600 * v; p.poly([[80, y], [140, y - 36], [140, y + 36]], "#2b2b33", 6);
    icon.frown(p, 0, -400, 54, "#ff8a7a"); icon.smile(p, 0, 400, 54, "#9be37a");
  },
  wheel: (p, a = 0) => { p.ell(0, 0, 260, 260, null, 0); p.arc(0, 0, 250, 250, 0, 360, 44, "#e74c3c"); p.arc(0, 0, 250, 250, 0, 360, 6); for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3 + Math.PI / 2; p.band([[0, 0], [Math.cos(aa) * 240, Math.sin(aa) * 240]], "#f1c40f", 30, 6); } p.ell(0, 0, 60, 60, "#3498db", 10); },
  thought: (p, fruit = "raspberry", k = 1) => {
    p.g.save(); p.g.scale(k, k);
    p.ell(-150, 300, 22, 22, "#ffffff", 7); p.ell(-90, 220, 36, 36, "#ffffff", 7);
    const pts = []; for (let i = 0; i < 90; i++) { const t = i / 90 * Math.PI * 2; const b = 1 + 0.09 * Math.abs(Math.sin(t * 4)); pts.push([Math.cos(t) * 230 * b, -40 + Math.sin(t) * 170 * b]); }
    p.poly(pts, "#ffffff", 10);
    if (fruit === "raspberry") { for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 20 + (i % 4) * 22; p.ell(Math.cos(a) * r, -40 + Math.sin(a) * r * 0.9, 30, 30, "#e0306a", 5); } p.poly([[-40, -150], [0, -120], [40, -150], [0, -170]], "#4a9a3a", 5); }
    if (fruit === "cherry") { for (const s of [-1, 1]) { p.stroke(curve([s * 60, 10], [s * 20, -100], [10, -160]), 9, "#4a7a2e"); p.ell(s * 60, 30, 62, 58, "#c8102e", 8); p.ell(s * 60 - 20, 10, 14, 10, "#ff8a9a", 0); } p.ell(30, -160, 50, 22, "#5cae4a", 6); }
    if (fruit === "blackberry") { for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 15 + (i % 4) * 22; p.ell(Math.cos(a) * r * 0.85, -30 + Math.sin(a) * r, 28, 28, "#3b1f4a", 5); p.dot(Math.cos(a) * r * 0.85 - 8, -38 + Math.sin(a) * r, 6, "#8a6aa8"); } p.poly([[-40, -150], [0, -120], [40, -150], [0, -170]], "#4a9a3a", 5); }
    if (fruit === "grape") icon.grape(p, 0, -40, 220);
    p.g.restore();
  },
  cloud: (p, col = "#e53935", k = 1, angry = true, seed = 1) => {
    const pts = []; for (let i = 0; i < 90; i++) { const t = i / 90 * Math.PI * 2; const b = 1 + 0.12 * Math.abs(Math.sin(t * 5 + seed)); pts.push([Math.cos(t) * 260 * b * k, Math.sin(t) * 150 * b * k]); }
    p.poly(pts, col, 10 * Math.max(0.4, k));
    if (angry && k > 0.3) { p.poly([[-40 * k, 120 * k], [10 * k, 40 * k], [-10 * k, 40 * k], [40 * k, -60 * k], [-20 * k, 20 * k], [0, 20 * k]], "#ffe14a", 5); for (const s of [-1, 1]) p.stroke([[s * 120 * k, -40 * k], [s * 60 * k, -10 * k]], 12 * k, "#7a0f12"); }
  },
  steam: (p, t = 0) => { for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1; p.g.save(); p.g.globalAlpha = Math.min(1, (1 - k) * 2); p.ell(Math.sin(k * 6 + i) * 40, 200 - k * 420, 50 + k * 70, 40 + k * 55, "#ffffff", 7); p.g.restore(); } },
  puff: (p, k = 0, col = "#ffffff") => { p.g.save(); p.g.globalAlpha = Math.max(0, 1 - k * k); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 60 + 180 * k; p.ell(Math.cos(a) * r, Math.sin(a) * r * 0.6, 80 + 50 * k, 70 + 40 * k, col, 8); } p.g.restore(); },
  spark: (p, k = 0) => { const s = 1 - Math.abs(k - 0.4) * 1.6; if (s <= 0) return; icon.star(p, 0, 0, 220 * s, "#ffe14a", 10); icon.star(p, 0, 0, 110 * s, "#ffffff", 0); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + k * 2; p.stroke([[Math.cos(a) * 240 * s, Math.sin(a) * 240 * s], [Math.cos(a) * 340 * s, Math.sin(a) * 340 * s]], 16, "#ffb300"); } },
  sparkles: (p, t = 0, n = 7, col = "#fff6c4") => { for (let i = 0; i < n; i++) { const k = (t * 1.3 + i / n) % 1, a = i * 2.4; const s = Math.sin(k * Math.PI); icon.sparkle(p, Math.cos(a) * (120 + 220 * (i % 3) / 2), Math.sin(a) * (120 + 200 * ((i + 1) % 3) / 2) - k * 60, 20 + 40 * s, col); } },
  bird: (p, t = 0, col = "#3d5a80") => { const w = Math.sin(t * Math.PI * 2) * 70; p.ell(0, 0, 90, 60, col, 9); p.ell(70, -40, 46, 42, col, 9); p.dot(84, -48, 8); p.poly([[112, -40], [150, -30], [112, -22]], "#f2a93b", 5); p.poly([[-20, -10], [40, -10], [10, -60 - w]], mul(col, [1.2, 1.2, 1.2]), 7); p.poly([[-90, 0], [-150, -30], [-150, 20]], col, 7); },
  leaf: (p, col = "#4f9a3a") => { p.poly([[0, -120], [80, -10], [0, 120], [-80, -10]], col, 9); p.stroke([[0, -100], [0, 100]], 6); },
  tree: (p, k = 1, seed = 2) => { // time-lapse tree: bare branches -> leafy crown
    p.band([[0, 380], [0, 40]], "#7a5434", 46, 8);
    const br = [[[0, 120], [-160, -60]], [[0, 80], [170, -80]], [[0, 40], [-60, -220]], [[0, 40], [80, -240]], [[-120, -20], [-230, -120]], [[120, -40], [230, -150]]];
    for (const [a, b] of br) p.band([a, b], "#7a5434", 18, 6, "round");
    if (k > 0) { const n = 14; for (let i = 0; i < n; i++) { const a = i * 2.39 + seed, r = 150 * Math.sqrt((i + 0.5) / n); const s = Math.max(0, Math.min(1, k * 1.6 - i / n * 0.6)); if (s > 0) p.ell(Math.cos(a) * r * 1.3, -130 + Math.sin(a) * r, 90 * s, 80 * s, i % 3 ? "#5cae4a" : "#78c25a", 7 * Math.max(0.4, s)); } }
    if (k > 0.85) for (let i = 0; i < 4; i++) p.ell(-120 + i * 80, -140 + (i % 2) * 60, 14, 14, "#ff8aa5", 4);
  },
  panel: (p, lit = -1, press = 0) => { // elevator panel: no digits — round buttons, door icons, keyhole, dot indicators
    p.poly(rrect(-200, -460, 200, 460, 30), "#c9d0d6", 10); p.clip(rrect(-200, -460, 200, 460, 30), () => { for (let i = 0; i < 40; i++) p.stroke([[-210, -460 + i * 24], [210, -456 + i * 24]], 2, "#b6bdc4"); });
    for (let i = 0; i < 8; i++) { const x = (i % 2 ? 70 : -70), y = -330 + Math.floor(i / 2) * 120; p.ell(x, y, 46, 46, "#e3e7eb", 7); p.ell(x, y, 30, 30, i === 5 ? "#ffd24a" : "#f5f7f9", 4); }
    const btn = (x, y, inward, on) => { p.ell(x, y, 52, 52, on ? "#ffd24a" : "#e3e7eb", 8); const s = inward ? 1 : -1;
      p.poly([[x - 36, y - 20], [x - 36 + s * 0 + (inward ? 26 : 0), y], [x - 36, y + 20]].map(([a, b]) => [a, b]), null, 0);
      if (inward) { p.poly([[x - 38, y - 20], [x - 12, y], [x - 38, y + 20]], "#2b2b33", 0); p.poly([[x + 38, y - 20], [x + 12, y], [x + 38, y + 20]], "#2b2b33", 0); }
      else { p.poly([[x - 14, y - 20], [x - 40, y], [x - 14, y + 20]], "#2b2b33", 0); p.poly([[x + 14, y - 20], [x + 40, y], [x + 14, y + 20]], "#2b2b33", 0); }
      p.stroke([[x, y - 24], [x, y + 24]], 7, "#2b2b33"); };
    btn(-80, 200, false, lit === 0); btn(80, 200, true, lit === 1);
    p.ell(0, 340, 34, 34, "#9aa3ad", 6); p.ell(0, 334, 9, 9, "#2b2b33", 0); p.poly([[-5, 334], [5, 334], [8, 362], [-8, 362]], "#2b2b33", 0);
  },
  hand: (p, k = 0) => { // close-up pointing hand (for button punch-ins)
    p.poly([[-420, 180], [-120, 120], [-60, 60], [80, 70], [210, 54], [240, 80], [210, 110], [90, 112], [60, 170], [-10, 220], [-420, 290]], "#ffd6b5", 12);
    p.stroke([[60, 112], [-10, 120]], 6, "#d9a07a"); p.stroke([[-60, 160], [20, 160]], 6, "#d9a07a"); p.poly([[-420, 170], [-200, 140], [-180, 300], [-420, 320]], "#2f4d7a", 10);
  },
  blueprint: (p, kind = "wire", t = 0) => { // white line art for the cutaway
    const W_ = "#eaf6ff", g = p.g; g.save();
    const L = (pts, w = 6) => p.stroke(pts, w, W_);
    if (kind === "wire") {
      L(rrect(-160, -280, 160, 280, 20)); for (let i = 0; i < 3; i++) p.ell(0, -150 + i * 130, 46, 46, null, 0), p.arc(0, -150 + i * 130, 46, 46, 0, 360, 6, W_);
      p.arc(0, 110, 46, 46, 0, 360, 10, "#ffd24a");
      const sw = Math.sin(t * Math.PI * 2) * 0.5; const ex = 0 + Math.sin(sw) * 200, ey = 110 + 60 + Math.cos(sw) * 200;
      L(curve([0, 160], [0 + Math.sin(sw) * 120, 230], [ex, ey]), 8); p.stroke([[ex - 14, ey], [ex - 4, ey + 16], [ex + 6, ey - 6], [ex + 16, ey + 12]], 5, "#ffd24a");
      L([[340, ey - 30], [330, ey + 40]], 8); L(curve([340, ey - 30], [380, -200], [420, -380]), 8); p.stroke([[326, ey + 40], [336, ey + 56], [346, ey + 38], [356, ey + 58]], 5, "#ffd24a");
    } else if (kind === "gears") {
      for (const [x, y, r, dir] of [[-140, 0, 120, 1], [70, -110, 80, -1], [90, 120, 70, -1]]) { const a0 = t * Math.PI * 2 * dir * (120 / r); const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; const rr = r + (Math.floor(i / 4) % 2 ? 18 : 0); pts.push([x + Math.cos(a + a0) * rr, y + Math.sin(a + a0) * rr]); } pts.push(pts[0]); L(pts, 6); p.arc(x, y, r * 0.35, r * 0.35, 0, 360, 6, W_); L([[x + Math.cos(a0) * r * 0.35, y + Math.sin(a0) * r * 0.35], [x + Math.cos(a0) * r * 0.8, y + Math.sin(a0) * r * 0.8]], 5); }
    } else if (kind === "hourglass") { g.globalAlpha = 1; L([[-110, -260], [110, -260], [16, -10], [110, 240], [-110, 240], [-16, -10], [-110, -260]], 7); L([[-140, -270], [140, -270]], 10); L([[-140, 250], [140, 250]], 10); const k = t % 1; p.poly([[-110 + 94 * k, -260 + 250 * k], [110 - 94 * k, -260 + 250 * k], [16, -10], [-16, -10]], "#eaf6ff66", 0); p.poly([[-110, 240], [110, 240], [0, 240 - 200 * k]], "#eaf6ff66", 0); }
    else if (kind === "door") { L(rrect(-300, -320, 300, 320, 10), 7); const o = t; L([[-290 + o * 0, -310], [-10 - o * 200, -310], [-10 - o * 200, 310], [-290, 310]], 6); L([[290, -310], [10 + o * 200, -310], [10 + o * 200, 310], [290, 310]], 6); L([[-150, -360], [150, -360]], 5); L([[-100, -400], [-100, -360]], 4); L([[100, -400], [100, -360]], 4); }
    g.restore();
  },
  buttonBox: (p, cut = 1, press = 0) => { // pedestrian push-button box with a cutaway showing a loose wire
    p.band([[0, 420], [0, 120]], "#6b7480", 46, 8); p.poly(rrect(-140, -260, 140, 140, 24), "#f2c14e", 10);
    p.ell(0, -40, 70 - press * 8, 70 - press * 8, "#c9d0d6", 9); p.ell(0, -40, 40, 40, press > 0.5 ? "#ffffff" : "#e3e7eb", 6); icon.star(p, 0, -170, 34, "#2b2b33");
    if (cut > 0) { p.g.save(); p.g.globalAlpha = cut; p.poly(rrect(-120, 10, 120, 130, 12), "#1f3a5f", 6); p.stroke(curve([-80, 30], [-60, 110], [-20, 90]), 7, "#e74c3c"); p.stroke([[-20, 90], [-10, 102], [0, 86], [10, 100]], 4, "#ffd24a"); p.stroke(curve([80, 30], [70, 100], [50, 120]), 7, "#3498db"); p.g.restore(); }
  },
  taxi: (p) => {},
  meta: (p, t = 0) => { // taster close-up: tongue taped shut, eyes huge and sparkling
    const H = headBlob(5, 300, 0), cx = 0, cy = 0;
    const hp = blobPts(cx, cy, H); p.shadedFill(hp, "#f5c9a0", mul("#f5c9a0", SH_SKIN), rad(-120), H.a); p.inkRing(hp, 16, thickAngle(rad(-120)));
    p.poly(blobPts(cx, cy - 40, { ...H, a: H.a * 1.04, b: H.b * 1.02 }).filter(([x, y]) => y < cy - H.b * 0.35), "#5a3b2a", 0);
    for (const s of [-1, 1]) { const x = cx + s * 110, y = cy - 20; p.ell(x, y, 90, 104, "#ffffff", 12); p.dot(x + 6, y + 10, 52, "#2b1d33"); p.dot(x + 6, y + 10, 28, "#3f6fb5"); p.dot(x - 18, y - 16, 20, "#fff"); icon.sparkle(p, x + 30, y + 34, 16 + 6 * Math.sin(t * 12 + s), "#ffffff"); }
    p.ell(cx, cy + 180, 70, 36, "#7a2440", 10); p.poly(rrect(cx - 46, cy + 170, cx + 46, cy + 280, 40), "#ef7f8f", 10);
    p.g.save(); p.g.translate(cx, cy + 230); p.g.rotate(-0.25); p.poly(rrect(-90, -26, 90, 26, 6), "#f2e3c2", 8); for (let i = 0; i < 5; i++) p.dot(-60 + i * 30, 0, 4, "#d8c39a"); p.g.restore();
    p.g.save(); p.g.translate(cx, cy + 230); p.g.rotate(0.35); p.poly(rrect(-90, -26, 90, 26, 6), "#f2e3c2", 8); p.g.restore();
  },
  arrowDown: (p) => {},
  splat: (p, k = 1, col = "#c0171a") => { for (let i = 0; i < 8; i++) { const a = i * 0.785, r = 120 * k; p.ell(Math.cos(a) * r, Math.sin(a) * r * 0.5, 40 * k, 30 * k, col, 0); } p.ell(0, 0, 150 * k, 90 * k, col, 0); },
  drop: (p, col = "#c0171a") => { p.poly([[0, -120], [60, 20], [50, 70], [0, 100], [-50, 70], [-60, 20]], col, 9); p.ell(-18, 30, 12, 20, "#ffffff88", 0); },
  dropper: (p, sq = 0) => { p.poly(rrect(-36, -300, 36, -150, 30), "#d23c3c", 8); p.poly([[-26, -150], [26, -150], [10, 220], [-10, 220]], "#eef7fbcc", 8); p.clip([[-26, -150], [26, -150], [10, 220], [-10, 220]], () => p.poly([[-30, 60], [30, 60], [30, 230], [-30, 230]], "#c0171a", 0)); },
  bubble: (p, k = 1) => { p.ell(0, 0, 120 * k, 120 * k, "#bfe9ff66", 7); p.ell(-40 * k, -40 * k, 24 * k, 18 * k, "#ffffffcc", 0); },
  scribble: (p, k = 1) => { // grey stress scribble cloud
    const pts = []; for (let i = 0; i < 140; i++) { const t = i / 140 * Math.PI * 8; const r = (140 + 60 * Math.sin(i * 0.7)) * k; pts.push([Math.cos(t) * r * 1.4, Math.sin(t) * r * 0.7]); } p.stroke(pts, 12 * Math.max(0.3, k), "#5b5f6b");
  },
  fountain: (p, t = 0) => { for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22, k = (t * 2 + i * 0.13) % 1; p.stroke(curve([0, 200], [Math.cos(a) * 160, -140], [Math.cos(a) * 320, 200 - 40 * k]), 10, "#bfe9ffcc"); } for (let i = 0; i < 10; i++) { const k = (t * 3 + i * 0.1) % 1; p.ell(Math.sin(i * 2.3) * 300 * k, 200 - Math.sin(k * Math.PI) * 120, 10, 14, "#e9f8ffcc", 0); } },
  leafShadow: (p, t = 0) => { p.g.save(); p.g.globalAlpha = 0.35; for (let i = 0; i < 26; i++) { const x = -700 + (i % 7) * 230 + Math.sin(t * 2 + i) * 40, y = -380 + Math.floor(i / 7) * 220 + Math.cos(t * 1.6 + i * 1.3) * 30; p.ell(x, y, 70 + (i % 3) * 25, 40 + (i % 2) * 20, "#2f5a2a", 0, 0, 360, (i * 37) % 180); } p.g.restore(); },
  sunbeam: (p, a = 0.4) => { p.g.save(); p.g.globalAlpha = a; for (let i = 0; i < 4; i++) p.poly([[-500 + i * 260, -450], [-380 + i * 260, -450], [-100 + i * 300, 450], [-260 + i * 300, 450]], "#fff2b0", 0); p.g.restore(); },

  rollerV: (p, k = 0) => { // vertical giant roller: head centred at origin, frame + handle to the left
    p.stroke([[0, -345], [-150, -345], [-150, -180], [-150, 420]], 30); p.stroke([[0, -345], [-150, -345], [-150, -180], [-150, 420]], 16, "#c7ccd2");
    p.band([[-150, 180], [-150, 420]], "#8a5a34", 40, 8, "round");
    p.poly(rrect(-75, -330, 75, 330, 60), "#f48fb1", 12); p.clip(rrect(-75, -330, 75, 330, 60), () => { for (let i = 0; i < 18; i++) { const y = -330 + ((i * 40 + k * 400) % 720); p.stroke([[-75, y], [75, y + 20]], 6, "#e0709a"); } p.poly([[30, -340], [80, -340], [80, 340], [30, 340]], "#ffffff33", 0); });
    for (let i = 0; i < 3; i++) p.ell(-60 + i * 4, 360 + i * 30, 14, 20, "#f48fb1", 5);
  },
  armwrestle: (p, th = 115, colL = "#e8b48a", colR = "#ecd0b6", slL = "#f39a3c", slR = "#3b5b8a") => {
    const a = th * Math.PI / 180, ex = 210, L = 330, P = [ex + L * Math.cos(a), -L * Math.sin(a)];
    const arm = (e, col, sl, w) => { const m = [e[0] * 0.55 + P[0] * 0.45, e[1] * 0.55 + P[1] * 0.45]; p.band([e, m], sl, w + 6, 8, "round"); p.band([m, P], col, w, 8, "round"); };
    arm([-ex, 0], colL, slL, 78); arm([ex, 0], colR, slR, 36);
    p.ell(P[0], P[1], 62, 54, colL, 9); p.ell(P[0] + 18, P[1] - 18, 40, 36, colR, 8); for (let i = 0; i < 3; i++) p.stroke([[P[0] - 30 + i * 22, P[1] + 10], [P[0] - 26 + i * 22, P[1] + 34]], 5);
    icon.anchor(p, -ex * 0.55, -40, 30, "#2c5a8a");
    for (const e of [[-ex, 0], [ex, 0]]) p.ell(e[0], e[1] + 20, 60, 26, "#00000022", 0);
  },
  jug: (p, tilt = 0, flow = 0) => { p.g.save(); p.g.rotate(-tilt);
    p.poly([[-120, 200], [120, 200], [150, -40], [70, -200], [-70, -200], [-150, -40]], "#d9ecf2cc", 10); p.clip([[-120, 200], [120, 200], [150, -40], [70, -200], [-70, -200], [-150, -40]], () => p.poly([[-200, -20 + tilt * 60], [200, -20 - tilt * 120], [200, 220], [-200, 220]], "#efe2a0", 0));
    p.poly([[-70, -200], [-110, -240], [-60, -230]], "#d9ecf2", 8); p.arc(170, 0, 60, 110, -80, 80, 16); p.stroke([[-90, -120], [-100, 120]], 14, "#ffffffaa"); p.g.restore();
    if (flow > 0) p.stroke([[-200, -170], [-215, -170 + 330 * flow]], 18, "#efe2a0"); },
  paintBucket: (p) => { p.poly([[-170, -150], [170, -150], [140, 200], [-140, 200]], "#f4f5f7", 10); p.ell(0, -150, 170, 40, "#f48fb1", 10); p.ell(-40, -160, 50, 10, "#ffd0de", 0); p.arc(0, -150, 190, 150, 190, 350, 9, "#7f8794"); for (let i = 0; i < 3; i++) p.ell(-120 + i * 110, -100 + (i % 2) * 40, 18, 30, "#f48fb1", 5); },
  pottedTree: (p) => { p.poly([[-130, 120], [130, 120], [100, 360], [-100, 360]], "#c9673f", 10); p.poly(rrect(-150, 90, 150, 140, 14), "#b5562f", 8); p.band([[0, 110], [0, -60]], "#7a5434", 26, 7); for (let i = 0; i < 6; i++) { const a = i * 1.05; p.ell(Math.cos(a) * 90, -170 + Math.sin(a) * 70, 100, 90, i % 2 ? "#5cae4a" : "#78c25a", 8); } p.ell(0, -170, 100, 90, "#78c25a", 8); },
  button: (p, lit = 0) => { p.ell(0, 30, 230, 230, "#9aa3ad", 12); p.ell(0, 0, 230, 230, "#c9d0d6", 12); p.ell(0, 0, 150, 150, lit ? "#ffd24a" : "#f5f7f9", 10); p.poly([[-90, -50], [-30, 0], [-90, 50]], "#2b2b33", 0); p.poly([[90, -50], [30, 0], [90, 50]], "#2b2b33", 0); p.stroke([[0, -60], [0, 60]], 14, "#2b2b33"); },
  spittoon: (p) => { p.poly([[-150, -120], [150, -120], [120, 160], [-120, 160]], "#b8c2cc", 10); p.ell(0, -120, 150, 36, "#6a7480", 10); p.stroke([[-110, -60], [-100, 120]], 12, "#ffffff88"); },
  spray: (p, k = 0) => { for (let i = 0; i < 12; i++) { const a = -0.5 + i * 0.09, d = 60 + k * 300 * (0.6 + (i % 3) * 0.2); p.ell(Math.cos(a) * d, Math.sin(a) * d * 0.6 + k * k * 120, 14 * (1 - k * 0.5), 10 * (1 - k * 0.5), "#b0122a", 3); } },
};
export const prop = (name, ...args) => (p, dw, dh) => { p.g.translate(dw / 2, dh / 2); PROP[name](p, ...args); };
export const brainCard = (o) => (p) => brain(p, o);
export const personCard = (O, o) => (p) => person(p, O, o);
export const signCard = (n) => (p, dw, dh) => { p.g.translate(dw / 2 - 300, dh / 2 - 420); dotSign(p, n); };
