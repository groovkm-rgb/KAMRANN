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
    const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
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

// =====================================================================================================
// EMU WAR cast (1930s Australian wheatbelt) — our own cartoon designs, no real persons, no insignia, no text
// =====================================================================================================
FACE.wink = { eye: ["dot", "squeeze"], brow: [-3, -1], mouth: "smirk" };
FACE.angry = { eye: ["dot", "dot"], brow: [7, -4], mouth: "teeth" };
FACE.yell = { eye: ["dot", "dot"], brow: [7, -4], mouth: "O" };
FACE.determined = { eye: ["lid", "lid"], brow: [6, -3], mouth: "dash" };
FACE.sad = { eye: ["lid", "lid"], brow: [-5, 4], mouth: "frown" };
FACE.proud = { eye: ["lid", "lid"], brow: [-2, -3], mouth: "smirk" };
FACE.panic = { eye: ["shock", "shock"], brow: [-7, -6], mouth: "teeth" };
FACE.aim = { eye: ["squeeze", "dot"], brow: [6, -2], mouth: "teeth" };
FACE.chatter = { eye: ["shock", "shock"], brow: [-6, -5], mouth: "teeth" };
const KH = "#b79c63", KHP = "#9c8453", KHH = "#a1875a", BOOT = "#4a2f1e", WEB = "#d9cb9c", LEATH = "#6e4024";
Object.assign(OUTFITS, {
  cmdr: { tunic: "#b09358", pants: KHP, skin: "#f6c6a2", stout: true, hat: "peak", stache: "#5b3a22", nose: "#e2534a", sam: true, uniform: true, hair: "#6b4a30" },
  sold1: { tunic: KH, pants: KHP, skin: "#f7d3b2", hat: "slouch", ears: true, lanky: true, uniform: true, puttees: true },
  sold2: { tunic: KH, pants: KHP, skin: "#f3c39c", hat: "slouch", stout: true, uniform: true, puttees: true },
  sold3: { tunic: "#b39860", pants: KHP, skin: "#eebf98", hat: "slouch", uniform: true, puttees: true },
  sold4: { tunic: "#ba9f66", pants: KHP, skin: "#d9a07a", hat: "slouch", uniform: true, puttees: true },
  farmA: { tunic: "#cfd6dc", over: "#4f6f9a", pants: "#4f6f9a", skin: "#d9835a", hat: "straw", boots: "#4b3020", stache: "#7a4a2a" },
  farmB: { tunic: "#b9433a", vest: "#5d4632", pants: "#6d5a44", skin: "#cf7a52", hat: "felt", boots: "#3e281a", stout: true },
  farmC: { tunic: "#d8c08a", over: "#7a6346", pants: "#7a6346", skin: "#e39068", hat: "straw2", boots: "#4b3020" },
});
const HATCOL = { slouch: "#a1875a", peak: "#a68c5c", straw: "#e6c77f", straw2: "#d9b36a", felt: "#7a5a3c" };

/** front-view hat. H = head blob dims, (cx,hc) head centre. Also used for loose hat cards and the chief emu. */
export const hatFront = (p, kind, H, cx, hc, light, u, opts = {}) => {
  const ow = 4.2 * u, HH = 2 * H.b, a = H.a, crown = hc - H.b, col = opts.col || HATCOL[kind], dk = mul(col, [0.72, 0.7, 0.72]);
  if (kind === "slouch") {
    const by = hc - 0.38 * H.b;
    // pinned-up left brim (behind the crown)
    const fl = ellPts(cx - 0.9 * a, by - 0.3 * HH, 0.2 * a, 0.42 * HH, 0, 360, -8, 36);
    p.shadedFill(fl, col, dk, light, 0.3 * a, 0.3); p.poly(fl, null, ow);
    p.stroke(ellPts(cx - 0.9 * a, by - 0.3 * HH, 0.13 * a, 0.33 * HH, 100, 260, -8, 16), 1.6 * u, dk);
    const cr = [[cx - 0.84 * a, by], [cx - 0.8 * a, crown - 0.04 * HH], [cx - 0.42 * a, crown - 0.2 * HH], [cx, crown - 0.13 * HH], [cx + 0.42 * a, crown - 0.2 * HH], [cx + 0.8 * a, crown - 0.04 * HH], [cx + 0.84 * a, by]];
    const crs = curve(cr[0], cr[1], cr[2], 6).concat(curve(cr[2], cr[3], cr[4], 6).slice(1), curve(cr[4], cr[5], cr[6], 6).slice(1));
    p.shadedFill(crs, col, dk, light, a, 0.4); p.poly(crs, null, ow);
    p.stroke([[cx - 0.2 * a, crown - 0.16 * HH], [cx - 0.05 * a, crown - 0.02 * HH]], 1.8 * u, dk);
    p.stroke([[cx + 0.2 * a, crown - 0.16 * HH], [cx + 0.05 * a, crown - 0.02 * HH]], 1.8 * u, dk);
    // puggaree band
    const bd = [[cx - 0.84 * a, by - 0.13 * HH], [cx + 0.84 * a, by - 0.13 * HH], [cx + 0.85 * a, by], [cx - 0.85 * a, by]];
    p.poly(bd, "#7d6644", ow * 0.8);
    for (let i = 0; i < 5; i++) p.stroke([[cx - 0.8 * a + i * 0.4 * a, by - 0.1 * HH], [cx - 0.7 * a + i * 0.4 * a, by - 0.02 * HH]], 1.2 * u, "#5e4c32");
    // right brim (wide, sweeping)
    const br = ellPts(cx + 0.28 * a, by + 0.01 * HH, 1.2 * a, 0.11 * HH, 0, 360, 0, 48).filter(([x]) => x > cx - 0.86 * a);
    p.shadedFill(br, col, dk, light, a, 0.3); p.poly(br, null, ow);
    if (opts.leaves) leafy(p, cx, crown - 0.1 * HH, a, u, opts.seed || 1);
    return;
  }
  if (kind === "peak") {
    const by = hc - 0.45 * H.b, top = crown - 0.16 * HH;
    const body = [[cx - 0.86 * a, by], [cx - 0.98 * a, top + 0.04 * HH], [cx + 0.98 * a, top + 0.04 * HH], [cx + 0.86 * a, by]];
    p.shadedFill(body, col, dk, light, a, 0.4); p.poly(body, null, ow);
    const tp = ellPts(cx, top, 1.08 * a, 0.13 * HH, 0, 360, 0, 40);
    p.shadedFill(tp, col, dk, light, a, 0.3); p.poly(tp, null, ow);
    p.stroke(ellPts(cx, top + 0.01 * HH, 0.7 * a, 0.06 * HH, 200, 340, 0, 16), 1.5 * u, "#ffffff55");
    p.poly([[cx - 0.88 * a, by - 0.16 * HH], [cx + 0.88 * a, by - 0.16 * HH], [cx + 0.86 * a, by], [cx - 0.86 * a, by]], "#5c472b", ow * 0.8);
    const vz = ellPts(cx, by, 0.8 * a, 0.15 * HH, 0, 180, 0, 30); vz.push([cx - 0.8 * a, by]);
    p.poly(vz, "#2c241e", ow); p.stroke(ellPts(cx - 0.15 * a, by + 0.03 * HH, 0.4 * a, 0.06 * HH, 30, 120, 0, 10), 1.8 * u, "#ffffff66");
    p.stroke([[cx - 0.8 * a, by - 0.02 * HH], [cx + 0.8 * a, by - 0.02 * HH]], 2 * u, "#3a2c20");
    return;
  }
  // farmers: wide brim hats
  const by = hc - 0.42 * H.b, felt = kind === "felt";
  const brim = ellPts(cx, by, 1.62 * a, 0.14 * HH, 0, 360, opts.brimRot || 0, 56);
  p.shadedFill(brim, col, dk, light, 1.4 * a, 0.3); p.poly(brim, null, ow);
  const ct = felt ? crown - 0.2 * HH : crown - 0.12 * HH;
  const cr = [[cx - 0.72 * a, by], [cx - 0.68 * a, ct + 0.06 * HH], [cx - 0.3 * a, ct], [cx, ct + (felt ? 0.07 : 0.0) * HH], [cx + 0.3 * a, ct], [cx + 0.68 * a, ct + 0.06 * HH], [cx + 0.72 * a, by]];
  const crs = curve(cr[0], cr[1], cr[2], 6).concat(curve(cr[2], cr[3], cr[4], 6).slice(1), curve(cr[4], cr[5], cr[6], 6).slice(1));
  p.shadedFill(crs, col, dk, light, a, 0.4); p.poly(crs, null, ow);
  p.poly([[cx - 0.72 * a, by - 0.1 * HH], [cx + 0.72 * a, by - 0.1 * HH], [cx + 0.73 * a, by], [cx - 0.73 * a, by]], felt ? "#3d2c1e" : "#8a5a2c", ow * 0.8);
  if (!felt) { // straw weave
    p.clip(brim, () => { for (let i = 0; i < 14; i++) p.stroke(ellPts(cx, by, (0.8 + i * 0.06) * a, (0.07 + i * 0.006) * HH, 0, 360, 0, 40), 1 * u, "#b8924a88"); });
    p.clip(crs, () => { for (let i = 0; i < 6; i++) p.stroke([[cx - a, ct + i * 0.04 * HH], [cx + a, ct + i * 0.04 * HH]], 1 * u, "#b8924a88"); });
  }
  // front brim lip (in front of the face top)
  const lip = ellPts(cx, by, 1.62 * a, 0.14 * HH, 0, 180, opts.brimRot || 0, 30);
  p.stroke(lip, ow, INK);
};
const leafy = (p, cx, y, a, u, seed) => { // camouflage twigs + leaves stuck on a hat
  const cols = ["#5d8a3a", "#7aa04a", "#4a7030", "#8fae58"];
  for (let i = 0; i < 9; i++) {
    const ang = rad(-150 + i * 15 + 6 * Math.sin(seed + i)), L = (60 + 30 * Math.sin(i * 2.1 + seed)) * u * 1.2;
    const x1 = cx + Math.cos(ang) * L, y1 = y + Math.sin(ang) * L * 0.9;
    p.stroke([[cx + Math.cos(ang) * a * 0.3, y + 6 * u], [x1, y1]], 2.4 * u, "#5a3e24");
    for (const k of [0.55, 0.85, 1]) {
      const lx = cx + Math.cos(ang) * L * k, ly = y + Math.sin(ang) * L * 0.9 * k;
      p.ell(lx, ly, 13 * u, 6.5 * u, cols[(i + Math.round(k * 3)) % 4], 2 * u, 0, 360, ang * 180 / Math.PI + 30 * (k > 0.7 ? 1 : -1));
    }
  }
};

/** front-facing 1930s character (soldiers, commander, farmers). Same rig rules as romanFront. */
export const aussieFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = "hang", tilt = 0, headTilt = 0, bob = 0,
    light = rad(-120), step = 0, hatOff = false, leaves = false, wv = 0, legs = true, swing = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, O.lanky ? 104 : 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.lanky ? 1.16 : O.stout ? 1.02 : 1.08, legsL = O.lanky ? 1.72 : O.stout ? 1.08 : 1.36, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const pants = O.pants || mix(O.tunic, INK, 0.5), boots = O.boots || BOOT, sleeve = O.uniform ? shade(O.tunic, 0.92) : O.tunic;
  p.rot = null;
  // ---- legs (trousers + boots / puttees) ----
  if (legs) for (const side of [-1, 1]) {
    const ph = Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)), up = step ? Math.max(0, Math.sin(ph)) * 34 : 0, fw = step ? Math.cos(ph) * 10 * u : 0;
    const hx = cx + side * (O.stout ? 20 : 15) * u, fx = cx + side * (O.stout ? 26 : 20) * u + fw * 0.4, fy = sole - 6 * u - up;
    const lg = curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy - 8 * u]);
    p.stroke(lg, 10.5 * u + 2 * 2.3 * u, INK); p.stroke(lg, 10.5 * u, pants);
    if (O.puttees) { const k0 = 0.62; for (let k = 0; k < 5; k++) { const t = k0 + k * 0.07, q = lg[Math.round(t * 10)] || lg[10]; p.stroke([[q[0] - 6 * u, q[1] - 1.5 * u], [q[0] + 6 * u, q[1] + 1.5 * u]], 1.6 * u, mul(pants, [0.7, 0.7, 0.7])); } }
    const bt = [[fx - side * 7 * u, fy - 14 * u], [fx + side * 7 * u, fy - 14 * u], [fx + side * 9 * u, fy - 4 * u], [fx + side * 20 * u, fy - 3 * u], [fx + side * 22 * u, fy + 3 * u], [fx - side * 8 * u, fy + 3 * u]];
    p.poly(bt, boots, 2.4 * u); p.stroke([[fx - side * 4 * u, fy - 10 * u], [fx + side * 3 * u, fy - 10 * u]], 1.4 * u, "#ffffff44");
    if (O.boots) p.ell(fx + side * 12 * u, fy - 5 * u, 5 * u, 2 * u, "#8a6a3a", 0); // dusty toe
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const wide = O.stout ? 1.26 : O.lanky ? 0.8 : 1;
  const T = { a: (0.4 * W) / 1.06 * wide, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: O.stout ? 2.0 : 2.6, egg: O.stout ? 0.22 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22 + 6 * Math.sin(wv)), s[1] - 0.75 * HH]] };
      case "fist": return { pts: [s, [X(26), s[1] - 0.02 * HH], [X(12 + 5 * Math.sin(wv)), s[1] - 0.5 * HH - 10 * u * Math.sin(wv)]], fist: true };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(wv)), s[1] - 0.62 * HH]] };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]] };
      case "slam": { const k = Math.max(0, Math.sin(wv)); return { pts: [s, [X(14), s[1] + 0.05 * HH - k * 0.25 * HH], [tcx + side * 0.55 * T.a, torsoBot - 0.1 * HH - k * 0.55 * HH]], front: true, fist: true }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]] };
      case "binoc": return { pts: [s, [X(10), s[1] + 0.12 * HH], [cx + side * 22 * u, hc + 14 * u]], front: true };
      case "chestB": return { pts: [s, [X(6), s[1] + 0.3 * HH], [tcx + side * 0.28 * T.a, chin + 0.42 * HH]], front: true };
      case "march": { const a = Math.sin(swing * Math.PI * 2) * side; return { pts: [s, [X(6) + a * 10 * u, s[1] + 0.4 * HH], [X(4) + a * 26 * u, chin + 0.95 * HH]] }; }
      case "flail": return { pts: [s, [X(20), s[1] - 0.15 * HH], [X(36 + 12 * Math.sin(wv + side)), s[1] - 0.55 * HH + 14 * u * Math.cos(wv * 1.3)]] };
      case "salute": return side < 0 ? { pts: [s, [X(30), s[1] - 0.18 * HH], [cx - 26 * u, hc - 30 * u]] } : { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]] };
      case "grip": return { pts: [s, [X(8), s[1] + 0.35 * HH], [tcx + side * 0.1 * T.a, s[1] + 0.25 * HH]], front: true };
      case "shrug": return { pts: [s, [X(24), s[1] + 0.12 * HH], [X(40), s[1] - 0.12 * HH]], open: true };
      case "droop": return { pts: [s, [X(1), s[1] + 0.52 * HH], [X(-2), chin + 1.12 * HH]] };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    p.stroke(c, 7 * u + 2 * 2.2 * u, INK); p.stroke(c, 7 * u, sleeve);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, (a.fist ? 7 : 5.5) * u, INK);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.open) { for (const k of [-1, 0, 1]) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 9 * u, hy - 10 * u + k * 6 * u]], 2.2 * u); }
  };
  for (const a of arms) if (!a.front) drawArm(a);
  // hips / jacket skirt
  const hipCol = O.over || O.tunic;
  const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.98 * T.a, torsoBot + 0.26 * HH], [tcx - 0.98 * T.a, torsoBot + 0.26 * HH]];
  p.gradFill(sk, hipCol, mul(hipCol, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
  if (O.uniform) for (const s of [-1, 1]) p.stroke([[tcx + s * 0.45 * T.a, torsoBot - 0.02 * HH], [tcx + s * 0.75 * T.a, torsoBot - 0.02 * HH]], 1.6 * u, mul(hipCol, [0.6, 0.6, 0.6]));
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    const top = chin + 0.02 * HH, wy = torsoBot - 0.24 * HH;
    if (O.uniform) {
      for (const s of [-1, 1]) { // breast pockets with flaps (no badges)
        const px = tcx + s * 0.45 * T.a, py = top + 0.28 * HH, pw = 0.24 * T.a, ph = 0.2 * HH;
        p.poly([[px - pw, py], [px + pw, py], [px + pw, py + ph], [px - pw, py + ph]], null, 1.6 * u);
        p.poly([[px - pw - 2 * u, py - 2 * u], [px + pw + 2 * u, py - 2 * u], [px + pw, py + 0.07 * HH], [px, py + 0.1 * HH], [px - pw, py + 0.07 * HH]], mul(O.tunic, [0.92, 0.92, 0.9]), 1.6 * u);
        p.dot(px, py + 0.07 * HH, 2.2 * u, "#c9a24a");
      }
      for (let i = 0; i < 4; i++) p.dot(tcx, top + (0.16 + i * 0.2) * HH, 2.6 * u, "#c9a24a");
      p.band([[tcx - 1.4 * T.a, wy], [tcx + 1.4 * T.a, wy]], O.sam ? LEATH : WEB, 0.075 * HH, 1.4 * u);
      p.poly(rrect(tcx - 9 * u, wy - 7 * u, tcx + 9 * u, wy + 7 * u, 2 * u), O.sam ? "#c9a24a" : "#b8a272", 1.4 * u);
      if (O.sam) p.band([[tcx - 0.95 * T.a, top - 0.02 * HH], [tcx + 0.85 * T.a, wy]], LEATH, 0.06 * HH, 1.4 * u);
      else p.band([[tcx + 0.9 * T.a, top - 0.02 * HH], [tcx - 0.8 * T.a, wy]], WEB, 0.05 * HH, 1.2 * u);
    } else {
      if (O.over) { // bib overalls with straps
        p.poly([[tcx - 0.5 * T.a, top + 0.3 * HH], [tcx + 0.5 * T.a, top + 0.3 * HH], [tcx + 0.62 * T.a, torsoBot + 0.1 * HH], [tcx - 0.62 * T.a, torsoBot + 0.1 * HH]], O.over, 1.8 * u);
        for (const s of [-1, 1]) { p.band([[tcx + s * 0.42 * T.a, top + 0.32 * HH], [tcx + s * 0.62 * T.a, top - 0.05 * HH]], O.over, 0.05 * HH, 1.2 * u); p.dot(tcx + s * 0.4 * T.a, top + 0.33 * HH, 2.6 * u, "#d8d0b8"); }
        p.poly([[tcx - 0.2 * T.a, top + 0.4 * HH], [tcx + 0.2 * T.a, top + 0.4 * HH], [tcx + 0.2 * T.a, top + 0.55 * HH], [tcx - 0.2 * T.a, top + 0.55 * HH]], null, 1.4 * u);
      }
      if (O.vest) for (const s of [-1, 1]) p.poly([[tcx + s * 0.12 * T.a, top - 0.05 * HH], [tcx + s * 1.5 * T.a, top - 0.05 * HH], [tcx + s * 1.5 * T.a, torsoBot + 0.1 * HH], [tcx + s * 0.22 * T.a, torsoBot + 0.1 * HH]], O.vest, 1.8 * u);
      if (!O.over && !O.vest) p.band([[tcx - 1.4 * T.a, wy], [tcx + 1.4 * T.a, wy]], "#5a3b2a", 0.05 * HH, 1.2 * u);
      if (O.tunic === "#b9433a") p.clip(tp, () => { for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 0.25 * T.a, top - 0.1 * HH], [tcx + i * 0.25 * T.a, torsoBot]], 1.3 * u, "#7e2a26"); });
    }
  });
  p.inkRing(tp, ow, thick);
  // collar
  for (const s of [-1, 1]) p.poly([[tcx, chin + 0.02 * HH], [tcx + s * 0.32 * T.a, chin - 0.01 * HH], [tcx + s * 0.18 * T.a, chin + 0.16 * HH]], O.uniform ? mul(O.tunic, [0.95, 0.95, 0.93]) : shade(O.tunic, 1.05), 1.6 * u);
  for (const a of arms) if (a.front) drawArm(a);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (O.ears) for (const s of [-1, 1]) { p.ell(cx + s * (H.a + 4 * u), hc + 6 * u, 17 * u, 24 * u, skin, ow * 0.8, 0, 360, s * 15); p.arc(cx + s * (H.a + 6 * u), hc + 6 * u, 8 * u, 13 * u, s > 0 ? -70 : 110, s > 0 ? 70 : 250, 2 * u, mul(skin, [0.8, 0.62, 0.6])); }
  else for (const s of [-1, 1]) p.ell(cx + s * (H.a - 2 * u), hc + 8 * u, 9 * u, 13 * u, skin, ow * 0.7);
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (O.skin && O.skin.startsWith("#d") || O.skin === "#cf7a52" || O.skin === "#e39068") for (const s of [-1, 1]) p.ell(cx + s * 30 * u, hc + 14 * u, 11 * u, 6 * u, "#e9705a55", 0); // sunburnt cheeks
  if (hatOff && O.hair) { // bald dome with a few combed strands
    for (const s of [-1, 1]) p.ell(cx + s * 0.86 * H.a, hc - 0.05 * H.b, 0.18 * H.a, 0.32 * H.b, O.hair, 2.4 * u);
    for (let i = -2; i <= 2; i++) p.stroke(curve([cx + i * 12 * u, hc - 0.98 * H.b + 2 * u], [cx + i * 12 * u + 14 * u, hc - 1.12 * H.b], [cx + i * 12 * u + 26 * u, hc - 0.9 * H.b]), 2.2 * u, O.hair);
  }
  const brim = !hatOff && O.hat && O.hat !== "peak";
  faceFront(p, cx, hc, W, expr, facing, look, lid, false, skin, O.stache && !O.nose ? O.stache : null, !!O.stout);
  if (O.nose) p.ell(cx + 7 * u * facing, hc + 7 * u, 9.5 * u, 7.5 * u, O.nose, 2.2 * u), p.dot(cx + 7 * u * facing - 3 * u, hc + 4.5 * u, 2.4 * u, "#ffffffaa");
  if (O.nose && O.stache) { // big curled handlebar moustache
    const my = hc + 14 * u, mx = cx + 7 * u * facing;
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([mx + s * (3 + 30 * t) * u, my + (2 + 6 * Math.sin(t * Math.PI)) * u - t * t * 8 * u]); }
      const tip = pts[16], curl = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14 * Math.PI * 1.5; curl.push([tip[0] + s * Math.sin(t) * 7 * u, tip[1] - 6 * u + Math.cos(t) * 7 * u]); }
      const all = pts.concat(curl);
      p.stroke(all, 8.5 * u + 2 * 2.2 * u, INK);
      for (let i = 0; i < all.length - 1; i++) p.stroke([all[i], all[i + 1]], Math.max(3 * u, 8.5 * u * (1 - i / all.length * 0.85)), O.stache);
    }
  }
  if (!hatOff && O.hat) hatFront(p, O.hat, H, cx, hc, light, u, { leaves, seed });
  p.rot = null;
  if (L === "binoc" && R === "binoc") { // binoculars over the eyes
    const fx = cx + 7 * u * facing, by = hc - 2 * u;
    p.poly(rrect(fx - 22 * u, by - 6 * u, fx + 22 * u, by + 6 * u, 3 * u), "#3a3632", 2 * u);
    for (const s of [-1, 1]) { p.ell(fx + s * 14 * u, by, 13 * u, 14 * u, "#2a2724", 2.4 * u); p.ell(fx + s * 14 * u, by, 8.5 * u, 9.5 * u, "#8fb6d6", 1.6 * u); p.dot(fx + s * 14 * u - 3 * u, by - 3 * u, 2.4 * u, "#ffffff"); }
  } else if (O.sam) { // binoculars hanging on the chest
    const by = chin + 0.42 * HH;
    p.stroke([[tcx - 0.3 * T.a, chin + 0.05 * HH], [tcx - 0.1 * T.a, by]], 1.5 * u); p.stroke([[tcx + 0.3 * T.a, chin + 0.05 * HH], [tcx + 0.1 * T.a, by]], 1.5 * u);
    for (const s of [-1, 1]) p.poly(rrect(tcx + s * 9 * u - 7 * u, by - 4 * u, tcx + s * 9 * u + 7 * u, by + 14 * u, 3 * u), "#3a3632", 1.8 * u);
  }
};

/** loose hat card (falling / flying hats). opts.col to tint. */
export const hatCard = (p, kind, opts = {}) => {
  const H = { a: 118, b: 111 }, u = 2.36, hc = 560;
  hatFront(p, kind, H, 300, hc, rad(-120), u, opts);
};

// ---------------------------------------- EMUS ----------------------------------------
const EMU = { body: "#7c6957", dark: "#4f4136", light: "#a48e76", neck: "#7fa3c6", neckD: "#557aa0", leg: "#8d9096", legD: "#5f6368", beak: "#4a4038", beakL: "#7a6a5a", eye: "#ff9b22" };
const IK = (h, f, l1, l2, back = -1) => {
  const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.min(l1 + l2 - 0.5, Math.hypot(dx, dy)), a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
  return [h[0] + ux * a + back * (-uy) * hh * -1, h[1] + uy * a + back * ux * hh * -1];
};
const shaggy = (cx, cy, rx, ry, rot, seed, n = 90, amp = 0.07, droop = 0.12) => {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2, s = Math.sin(t), c = Math.cos(t);
    const tuft = (i % 3 === 0 ? 1 : 0.35) * amp * (0.7 + 0.6 * rnd(seed, i));
    let r = 1 + tuft * (s > -0.2 ? 1.3 : 0.6);
    let x = rx * c * r, y = ry * s * r + (s > 0 ? droop * ry * s * s * (1 + 0.5 * Math.sin(i * 1.7)) : 0);
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return pts;
};
/** emu eye. kind: open|smug|wink|shock|happy|closed|squint ; look -1..1 pupil shift */
const emuEye = (p, x, y, r, kind, look, u, side = 1) => {
  if (kind === "happy" || kind === "wink" || kind === "closed") {
    if (kind === "closed") { p.stroke([[x - r, y], [x + r, y]], 3.6 * u); return; }
    p.arc(x, y + r * 0.3, r * 0.95, r * 0.75, 200, 340, 4 * u); return;
  }
  const R = kind === "shock" ? r * 1.25 : r;
  p.ell(x, y, R, R * 1.05, "#fffaf0", 2.6 * u);
  p.ell(x + look * R * 0.25, y + R * 0.05, R * 0.78, R * 0.82, EMU.eye, 0);
  p.ell(x + look * R * 0.35, y + R * 0.08, R * (kind === "shock" ? 0.25 : 0.42), R * (kind === "shock" ? 0.27 : 0.46), INK, 0);
  p.dot(x + look * R * 0.35 - R * 0.22, y - R * 0.22, R * 0.18, "#ffffff");
  p.ell(x, y, R, R * 1.05, null, 2.6 * u);
  if (kind === "smug" || kind === "squint") { // heavy upper lid
    const k = kind === "smug" ? 0.15 : 0.45;
    const lid = ellPts(x, y, R * 1.08, R * 1.12, 180, 360, 0, 20); lid.push([x + R * 1.08, y + R * k], [x - R * 1.08, y + R * k]);
    p.poly(lid, EMU.dark, 2.6 * u); p.stroke([[x - R * 1.1, y + R * k], [x + R * 1.1, y + R * k]], 3.2 * u);
  }
};
/** EMU card. Faces right. o: pose run|stand|peck|proud|front|frontrun|flap, phase 0..1, expr neutral|smug|wink|grin|shock|happy|determined,
 *  head 'side'|'cam' (head turned to camera), chief, hat, tilt (deg, head), armor (tank), light, palette shift 'alt' */
export const emuDraw = (p, o = {}) => {
  const { pose = "stand", phase = 0, expr = "neutral", head = "side", chief = false, hat = false, headTilt = 0, armor = false, alt = 0, blink = 0, flap = 0, look = 0.3, lean = 0, mouthOpen = 0 } = o;
  const u = 2.2, ow = 5 * u, light = rad(-120), thick = thickAngle(light);
  const col = alt ? { ...EMU, body: alt > 0 ? "#8a7560" : "#6e5d4e", light: alt > 0 ? "#b39a80" : "#94806a" } : EMU;
  const front = pose === "front" || pose === "frontrun";
  const run = pose === "run" || pose === "frontrun", ph = phase * Math.PI * 2;
  const bob = run ? -Math.abs(Math.sin(ph)) * 22 : pose === "proud" ? -10 : 0;
  // ---------- FRONT VIEW (running towards camera / facing camera) ----------
  if (front) {
    const bx = 300, by = 575 + bob;
    for (const side of [-1, 1]) { // legs
      const lift = run ? Math.max(0, Math.sin(ph + (side > 0 ? Math.PI : 0))) : 0;
      const hx = bx + side * 48, hy = by + 90, fx = bx + side * 62, fy = 970 - lift * 110;
      const kx = bx + side * (70 + lift * 20), ky = (hy + fy) / 2 + 20 - lift * 40;
      p.stroke([[hx, hy], [kx, ky], [fx, fy]], 26 * u * 0.7 + 2 * 2.4 * u, INK); p.stroke([[hx, hy], [kx, ky], [fx, fy]], 26 * u * 0.7, side < 0 ? col.legD : col.leg);
      for (const k of [-1, 0, 1]) { p.stroke([[fx, fy], [fx + k * 26, fy + 8 + (k ? 0 : 8)]], 9 + 2 * 5, INK); p.stroke([[fx, fy], [fx + k * 26, fy + 8 + (k ? 0 : 8)]], 9, col.leg); }
    }
    const bp = shaggy(bx, by, 175, 150, 0, 4, 96, 0.08, 0.16);
    p.shadedFill(bp, col.body, col.dark, light, 175, 0.35); p.clip(bp, () => { for (let i = 0; i < 40; i++) { const a = rnd(9, i) * 6.28, r = rnd(8, i) * 140; const x = bx + Math.cos(a) * r, y = by + Math.sin(a) * r * 0.85; p.stroke([[x, y], [x + 6, y + 26]], 4, i % 3 ? col.dark : col.light); } });
    p.inkRing(bp, ow, thick);
    // neck
    const hx = 300 + (o.sway || 0), hy = 290 + bob * 0.6 + (o.headDrop || 0);
    const nk = curve([bx, by - 110], [bx + (hx - bx) * 0.4, (by + hy) / 2], [hx, hy + 40]);
    p.stroke(nk, 70 + 2 * ow * 0.5, INK); p.stroke(nk, 70, col.neck);
    p.clip(shaggy(bx, by - 60, 75, 70, 0, 3, 50, 0.12, 0.1), () => {}); // (kept for symmetry)
    const ruff = shaggy(bx, by - 120, 72, 46, 0, 5, 60, 0.14, 0.3); p.poly(ruff, col.body, 0); p.inkRing(ruff, ow * 0.7, thick);
    emuHead(p, hx, hy, { ...o, front: true, col, u, ow, thick, light });
    return;
  }
  // ---------- SIDE VIEW ----------
  const bodyRot = rad(pose === "proud" ? -14 : pose === "peck" ? 10 : run ? 6 + lean : lean);
  const bx = 285, by = (pose === "proud" ? 545 : 575) + bob;
  // legs (far leg first)
  const hip = [bx + 10, by + 70];
  if (!o.legsOff) for (const side of [-1, 1]) {
    const t = ph + (side > 0 ? Math.PI : 0);
    let foot;
    if (run) foot = [hip[0] - 150 * Math.cos(t) + 20, 972 - Math.max(0, Math.sin(t)) * 150];
    else if (pose === "peck") foot = [hip[0] + side * 40 - 10, 972];
    else foot = [hip[0] + side * 34 + 6, 972];
    const knee = IK(hip, foot, 190, 210, 1);
    const lc = side < 0 ? col.legD : col.leg;
    p.stroke([hip, knee], 40 + 2 * 2.4 * u, INK); p.stroke([hip, knee], 40, side < 0 ? mul(col.body, [0.8, 0.8, 0.8]) : col.body);
    p.stroke([knee, foot], 19 + 2 * 2.4 * u, INK); p.stroke([knee, foot], 19, lc);
    for (let k = 0; k < 4; k++) { const q = [knee[0] + (foot[0] - knee[0]) * (0.3 + k * 0.15), knee[1] + (foot[1] - knee[1]) * (0.3 + k * 0.15)]; p.stroke([[q[0] - 7, q[1]], [q[0] + 7, q[1] - 2]], 2.2, mul(lc, [0.7, 0.7, 0.7])); }
    const toe = run ? -0.25 * Math.sin(t) : 0;
    for (const k of [-0.35, 0, 0.35]) { const a = toe + k, e = [foot[0] + Math.cos(a) * 46, foot[1] + Math.sin(a) * 10 + 4]; p.stroke([foot, e], 10 + 2 * 2.2 * u, INK); p.stroke([foot, e], 10, lc); }
    p.stroke([foot, [foot[0] - 22, foot[1] + 2]], 9 + 2 * 2.2 * u, INK); p.stroke([foot, [foot[0] - 22, foot[1] + 2]], 9, lc);
  }
  // body
  const bp = shaggy(bx, by, 195, 132, bodyRot, 7 + (alt ? 3 : 0), 100, 0.075, 0.2);
  // tail fluff
  const tail = shaggy(bx - 170, by - 20, 70, 60, bodyRot - 0.4, 11, 50, 0.16, 0.4);
  if (armor) { p.poly(tail, "#7c8288", 0); }
  else { p.shadedFill(tail, col.body, col.dark, light, 70, 0.3); p.inkRing(tail, ow * 0.8, thick); }
  if (armor) {
    p.shadedFill(bp, "#8d949b", "#5d646b", light, 195, 0.35);
    p.clip(bp, () => { for (let i = -4; i <= 4; i++) { p.stroke([[bx + i * 48, by - 160], [bx + i * 48 + 20, by + 160]], 4 * u, "#565c62"); for (let k = -2; k <= 2; k++) p.dot(bx + i * 48 + 12 + k * 4, by + k * 50, 5, "#c9cfd4"); } });
    p.inkRing(bp, ow, thick);
  } else {
    p.shadedFill(bp, col.body, col.dark, light, 195, 0.35);
    p.clip(bp, () => {
      for (let i = 0; i < 70; i++) { const a = rnd(3, i) * 6.28, r = Math.sqrt(rnd(5, i)) * 170; const x = bx + Math.cos(a) * r, y = by + Math.sin(a) * r * 0.75;
        p.stroke(curve([x, y], [x - 10, y + 14], [x - 26, y + 30], 4), 4.5, i % 4 === 0 ? col.light : col.dark); }
      p.stroke(ellPts(bx - 30, by - 70, 120, 40, 200, 330, rad(bodyRot), 16), 7, col.light);
    });
    p.inkRing(bp, ow, thick);
    // little wing
    const wa = rad(-20 - flap * 70);
    const wx = bx + 60, wy = by - 30, wp = [[wx, wy], [wx + Math.cos(wa) * 80 - 20, wy + Math.sin(wa) * 80], [wx + Math.cos(wa + 0.5) * 70, wy + Math.sin(wa + 0.5) * 70], [wx + Math.cos(wa + 0.9) * 50, wy + Math.sin(wa + 0.9) * 50]];
    p.poly(wp, col.dark, 3.4 * u);
  }
  // neck
  let hx, hy;
  if (pose === "peck") { const k = 0.5 + 0.5 * Math.sin(ph); hx = bx + 250; hy = 860 - k * 140; }
  else if (pose === "proud") { hx = bx + 170; hy = 215; }
  else if (run) { hx = bx + 200 + Math.sin(ph * 2) * 6; hy = 315 + bob * 0.5 + Math.cos(ph * 2) * 6; }
  else { hx = bx + 175; hy = 250 + (o.headDrop || 0); }
  hx += o.headX || 0;
  const n0 = [bx + 130, by - 60];
  const nk = curve(n0, [n0[0] + (hx - n0[0]) * 0.2 + (pose === "peck" ? 80 : 30), (n0[1] + hy) / 2], [hx - 10, hy + 30]);
  if (armor) { p.stroke(nk, 64 + 2 * ow * 0.5, INK); p.stroke(nk, 64, "#8d949b"); for (let i = 2; i < 10; i += 2) p.stroke([[nk[i][0] - 30, nk[i][1]], [nk[i][0] + 30, nk[i][1] - 6]], 3 * u, "#5d646b"); }
  else {
    p.stroke(nk, 66 + 2 * ow * 0.5, INK); p.stroke(nk, 66, col.neck);
    p.stroke(nk.slice(3), 16, col.neckD + "88");
    const ruff = shaggy(n0[0] + 10, n0[1] - 10, 64, 56, rad(-40), 5, 50, 0.16, 0.2); p.poly(ruff, col.body, 0); p.stroke(ruff.slice(10, 40), ow * 0.6, INK);
  }
  emuHead(p, hx, hy, { ...o, front: false, col, u, ow, thick, light, peck: pose === "peck", proud: pose === "proud" });
};
const emuHead = (p, hx, hy, o) => {
  const { expr = "neutral", head = "side", chief = false, hat = false, headTilt = 0, armor = false, blink = 0, look = 0.3, col, u, ow, thick, light, front, mouthOpen = 0 } = o;
  const cam = front || head === "cam";
  const A = rad(headTilt + (o.proud ? -12 : 0));
  p.rot = A ? [A, hx, hy + 40] : null;
  const R = chief ? 92 : 84;
  // crown feathers
  const tufts = chief ? 9 : 7;
  for (let i = 0; i < tufts; i++) { const a = rad(-150 + i * (120 / (tufts - 1))), L = R * (0.95 + 0.25 * rnd(2, i)); p.stroke([[hx + Math.cos(a) * R * 0.6, hy + Math.sin(a) * R * 0.6], [hx + Math.cos(a) * L * 1.1, hy + Math.sin(a) * L * 1.05]], 13 + 2 * 2.2 * u, INK); p.stroke([[hx + Math.cos(a) * R * 0.6, hy + Math.sin(a) * R * 0.6], [hx + Math.cos(a) * L * 1.1, hy + Math.sin(a) * L * 1.05]], 13, col.dark); }
  if (chief && !hat) { // one feather standing straight up
    const f = curve([hx + 4, hy - R * 0.8], [hx + 18, hy - R * 1.9], [hx - 6, hy - R * 2.6], 12);
    p.stroke(f, 16 + 2 * 2.4 * u, INK); p.stroke(f, 16, col.dark); for (let i = 3; i < 12; i += 2) p.stroke([f[i], [f[i][0] + 18, f[i][1] + 10]], 4, col.dark), p.stroke([f[i], [f[i][0] - 18, f[i][1] + 10]], 4, col.dark);
  }
  const hp = blobPts(hx, hy, { a: R * (cam ? 1.0 : 1.05), b: R * 0.9, nTop: 2.0, nBot: 2.3, egg: -0.1, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(hp, armor ? "#9aa1a8" : col.neck, armor ? "#6a7178" : col.neckD, light, R, 0.4);
  if (!armor) p.clip(hp, () => { for (let i = 0; i < 16; i++) { const a = rnd(4, i) * 6.28, r = rnd(6, i) * R * 0.8; p.stroke([[hx + Math.cos(a) * r, hy - R * 0.5 + Math.sin(a) * r * 0.4], [hx + Math.cos(a) * r - 4, hy - R * 0.5 + Math.sin(a) * r * 0.4 + 12]], 4, col.dark); } });
  p.inkRing(hp, ow, thick);
  if (armor) { p.poly([[hx - R * 0.9, hy - R * 0.15], [hx + R * 1.0, hy - R * 0.15], [hx + R * 0.95, hy - R * 0.45], [hx - R * 0.85, hy - R * 0.45]], "#5d646b", 2.4 * u); for (let k = -2; k <= 2; k++) p.dot(hx + k * R * 0.38, hy - R * 0.3, 4, "#c9cfd4"); }
  const L = blink >= 1 ? "closed" : null;
  const eyeK = (side) => L || (expr === "wink" ? (side > 0 ? "wink" : "open") : expr === "smug" || expr === "determined" ? "smug" : expr === "shock" ? "shock" : expr === "happy" ? "happy" : expr === "squint" ? "squint" : "open");
  if (cam) {
    for (const side of [-1, 1]) emuEye(p, hx + side * R * 0.42, hy - R * 0.14, R * 0.36, eyeK(side), look * 0.6, u, side);
    if (expr === "determined" || expr === "smug") for (const side of [-1, 1]) p.stroke([[hx + side * R * 0.15, hy - R * 0.48 + (expr === "determined" ? 6 : 0)], [hx + side * R * 0.72, hy - R * 0.6]], 5 * u, INK);
    // beak pointing at camera: a broad rounded wedge
    const bw = R * 0.62, bt = hy + R * 0.32, bh = R * 0.42;
    const bk = [[hx - bw, bt], [hx - bw * 0.7, bt - bh * 0.2], [hx, bt - bh * 0.32], [hx + bw * 0.7, bt - bh * 0.2], [hx + bw, bt], [hx + bw * 0.6, bt + bh * 0.75], [hx, bt + bh * (0.95 + mouthOpen * 0.4)], [hx - bw * 0.6, bt + bh * 0.75]];
    p.shadedFill(curve(bk[0], bk[2], bk[4], 10).concat(curve(bk[4], bk[6], bk[0], 10).slice(1)), col.beakL, col.beak, light, bw, 0.3);
    p.poly(curve(bk[0], bk[2], bk[4], 10).concat(curve(bk[4], bk[6], bk[0], 10).slice(1)), null, 2.6 * u);
    p.dot(hx - bw * 0.25, bt - bh * 0.05, 3.5, INK); p.dot(hx + bw * 0.25, bt - bh * 0.05, 3.5, INK);
    const grin = expr === "grin" || expr === "smug" || expr === "wink" || expr === "happy" || expr === "proud";
    const my = bt + bh * 0.42;
    if (mouthOpen > 0.05) p.ell(hx, my + 4, bw * 0.55, bh * 0.3 * mouthOpen + 4, "#5a1e28", 2.4 * u);
    p.stroke(grin ? curve([hx - bw * 1.08, my - bh * 0.55], [hx, my + bh * 0.35], [hx + bw * 1.08, my - bh * 0.55]) : [[hx - bw * 0.85, my], [hx + bw * 0.85, my]], 3.4 * u, INK);
    if (grin) for (const s of [-1, 1]) p.stroke([[hx + s * bw * 1.08, my - bh * 0.55], [hx + s * bw * 1.18, my - bh * 0.72]], 3 * u, INK);
  } else {
    emuEye(p, hx + R * 0.26, hy - R * 0.1, R * 0.4, eyeK(1), look, u, 1);
    if (expr === "determined" || expr === "smug") p.stroke([[hx + R * 0.02, hy - R * 0.55], [hx + R * 0.6, hy - R * 0.45 + (expr === "determined" ? 8 : -2)]], 5 * u, INK);
    const b0 = [hx + R * 0.7, hy + R * 0.08];
    const bk = [b0, [hx + R * 1.5, hy + R * 0.16], [hx + R * 1.6, hy + R * 0.3], [hx + R * 1.46, hy + R * 0.42 + mouthOpen * 20], [hx + R * 0.72, hy + R * 0.5]];
    p.shadedFill(bk, col.beakL, col.beak, light, R, 0.3); p.poly(bk, null, 2.6 * u);
    const grin = expr === "grin" || expr === "smug" || expr === "wink" || expr === "happy";
    p.stroke(grin ? curve([hx + R * 1.5, hy + R * 0.32], [hx + R * 1.0, hy + R * 0.44], [hx + R * 0.5, hy + R * 0.16]) : [[hx + R * 1.52, hy + R * 0.3], [hx + R * 0.7, hy + R * 0.3]], 3 * u, INK);
    p.dot(hx + R * 1.25, hy + R * 0.2, 3, INK);
  }
  if (hat) hatFront(p, "slouch", { a: R * 1.02, b: R * 0.94 }, hx, hy - R * 0.1, light, u * 0.62);
  p.rot = null;
};

// ---------------------------------------- FX (no text anywhere) ----------------------------------------
/** muzzle flash: k 0..1 frame variation */
export const fxFlash = (p, k = 0) => {
  const c = 300, n = 11, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + k, r = i % 2 ? 70 + 20 * Math.sin(k * 7 + i) : 230 + 70 * Math.sin(k * 5 + i * 1.7); pts.push([c + Math.cos(a) * r, 500 + Math.sin(a) * r]); }
  p.poly(pts, "#ffb02e", 10);
  const in2 = pts.map(([x, y]) => [c + (x - c) * 0.6, 500 + (y - 500) * 0.6]); p.poly(in2, "#ffe36a", 0);
  p.ell(c, 500, 70, 70, "#ffffff", 0);
};
/** single feather (popping off) */
export const fxFeather = (p, seed = 1) => {
  const c = rnd(seed, 1) < 0.5 ? "#7c6957" : "#a48e76";
  const f = curve([200, 700], [320, 500], [420, 280], 14);
  p.stroke(f, 10, INK);
  for (let i = 2; i < 14; i++) { const q = f[i], w = 70 * Math.sin(i / 14 * Math.PI); p.stroke([q, [q[0] - w, q[1] + 30]], 22, INK); p.stroke([q, [q[0] + w * 0.8, q[1] + 34]], 22, INK); }
  for (let i = 2; i < 14; i++) { const q = f[i], w = 70 * Math.sin(i / 14 * Math.PI); p.stroke([q, [q[0] - w, q[1] + 30]], 12, c); p.stroke([q, [q[0] + w * 0.8, q[1] + 34]], 12, c); }
  p.stroke(f, 5, "#d9cbb4");
};
/** dark smoke puff (gun jam). t 0..1 */
export const fxSmoke = (p, t) => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - t * t);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 60 + 120 * t; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6 - 140 * t, 95 + 50 * t, 80 + 40 * t, i % 2 ? "#6d6a66" : "#87837d", 10); }
  p.ell(300, 520 - 140 * t, 130 + 80 * t, 110 + 60 * t, "#9a958e", 0);
  g.restore();
};
/** spark / ricochet star */
export const fxSpark = (p, t = 0) => {
  const c = [300, 500], s = 1 - t * 0.6;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t, r = (i % 2 ? 90 : 190) * s; p.band([[c[0] + Math.cos(a) * 30, c[1] + Math.sin(a) * 30], [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]], "#fff3a0", 22, 7, "round"); }
  p.ell(c[0], c[1], 45 * s, 45 * s, "#ffffff", 7);
};
/** reddish dust cloud k 0..1 */
export const fxDustR = (p, k, col = "#d9a070") => fxDust(p, k, col);
/** wheat chaff burst */
export const fxChaff = (p, t, seed = 1) => {
  for (let i = 0; i < 16; i++) { const a = rnd(seed, i) * Math.PI * 2, r = 60 + 260 * t * (0.5 + rnd(seed, i + 40)), x = 300 + Math.cos(a) * r, y = 700 + Math.sin(a) * r * 0.5 - 300 * t + 300 * t * t;
    p.ell(x, y, 16, 7, i % 2 ? "#e9c25a" : "#c9952f", 4, 0, 360, a * 57); }
};
/** speed streaks */
export const fxSpeed = (p, t) => { for (let i = 0; i < 6; i++) { const y = 300 + i * 90, x0 = 80 + ((t * 600 + i * 137) % 260); p.band([[x0, y], [x0 + 260, y]], "#fff7e0", 12, 5, "round"); } };
/** thought bubble with the armoured, tracked "tank emu" and bullets bouncing off (sparks). t = time in s */
export const fxThought = (p, t, pop = 1) => {
  const g = p.g; g.save();
  const s = 0.2 + 0.8 * (1 - Math.pow(1 - Math.min(1, pop), 3)) + 0.06 * Math.sin(Math.min(1, pop) * 9) * (1 - Math.min(1, pop));
  g.translate(300, 380); g.scale(s, s); g.translate(-300, -380);
  // trailing dots towards the head (down-left)
  p.ell(170, 905, 26, 22, "#ffffff", 8); p.ell(220, 830, 40, 34, "#ffffff", 9);
  const bub = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; for (let k = 0; k <= 8; k++) { const b = a + k / 8 * Math.PI * 2 / 12; const r = 1 + 0.09 * Math.sin(k / 8 * Math.PI); bub.push([300 + Math.cos(b) * 290 * r, 400 + Math.sin(b) * 330 * r]); } }
  p.poly(bub, "#fffdf5", 10);
  p.clip(bub, () => {
    p.ell(300, 470, 300, 240, "#e9f1f7", 0);
    // the tank emu inside (scaled down)
    g.save(); g.translate(300, 410); g.scale(0.6, 0.6); g.translate(-300, -560);
    // tracks instead of legs
    const tr = rrect(110, 790, 520, 930, 70);
    p.poly(tr, "#3d3f42", 9);
    for (let i = 0; i < 5; i++) { p.ell(170 + i * 72, 860, 34, 34, "#7a7f85", 6); p.dot(170 + i * 72, 860, 8, INK); }
    for (let i = 0; i < 18; i++) { const x = 120 + ((i * 25 + t * 160) % 400); p.stroke([[x, 790], [x + 8, 802]], 6, "#8a8d90"); p.stroke([[x, 930], [x - 8, 918]], 6, "#8a8d90"); }
    emuDraw(p, { pose: "stand", armor: true, expr: "determined", look: 0.5, legsOff: true });
    g.restore();
    // bullets bouncing off with sparks
    for (let i = 0; i < 4; i++) {
      const k = ((t * 1.6 + i * 0.27) % 1), x = 60 + k * 230, y = 360 + i * 60 - (k > 0.6 ? (k - 0.6) * 300 : 0);
      if (k < 0.6) { p.ell(x, y, 22, 9, "#d9a845", 4); }
      else { const kk = (k - 0.6) / 0.4; g.save(); g.translate(250 + i * 10, 360 + i * 60); g.scale(0.32 * (1 - kk * 0.5), 0.32 * (1 - kk * 0.5)); g.translate(-300, -500); fxSpark(p, kk); g.restore();
        p.ell(250 - kk * 120, 340 + i * 60 - kk * 160, 18, 8, "#d9a845", 4, 0, 360, -40); }
    }
  });
  p.poly(bub, null, 10);
  g.restore();
};
/** emu sprite atlas for the herd: cols x rows cells of cw x ch px. Rows: 0 run, 1 run (alt), 2 peck/stand/proud, 3 front run/stand */
export const ATLAS = { cols: 10, rows: 4, cw: 288, ch: 480 };
export const emuAtlas = (g) => {
  const { cols, rows, cw, ch } = ATLAS;
  const cell = (c, r, o) => { g.save(); g.translate(c * cw, r * ch); g.scale(cw / 600, ch / 1000); emuDraw(new Pen(g), o); g.restore(); };
  for (let i = 0; i < 10; i++) cell(i, 0, { pose: "run", phase: i / 10, alt: 0 });
  for (let i = 0; i < 10; i++) cell(i, 1, { pose: "run", phase: i / 10, alt: i % 2 ? 1 : -1, expr: i % 3 ? "neutral" : "smug" });
  for (let i = 0; i < 4; i++) cell(i, 2, { pose: "peck", phase: i / 4, alt: i % 2 });
  cell(4, 2, { pose: "stand", alt: 0 }); cell(5, 2, { pose: "stand", alt: 1, head: "cam", expr: "smug" });
  cell(6, 2, { pose: "stand", alt: -1, flap: 1, head: "cam", expr: "happy" }); cell(7, 2, { pose: "stand", alt: 1, flap: 0.2, head: "cam", expr: "grin" });
  cell(8, 2, { pose: "proud", alt: 0 }); cell(9, 2, { pose: "proud", alt: 1, head: "cam", expr: "happy" });
  for (let i = 0; i < 8; i++) cell(i, 3, { pose: "frontrun", phase: i / 8, alt: i % 2 ? 1 : 0 });
  cell(8, 3, { pose: "front", alt: 0, expr: "smug" }); cell(9, 3, { pose: "front", alt: 1, expr: "happy" });
};
