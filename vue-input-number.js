
const FORMAT_PATTERN = /^(?<prefix>.*)%(?<padding>[0-9]*)(?:\.(?<paddingfloat>[0-9]+)){0,1}(?<format>[bodxXf])(?<suffix>.*)$/u;
const FORMAT_INFO		= {
	"b" : { "radix" : 2, "isUpperCase" : false, "fixed-input" : /^(?<decimal>[0-1]+)$/				, "not-fixed-input" : /^[0-1]*$/		},
	"o" : { "radix" : 8, "isUpperCase" : false, "fixed-input" : /^(?<decimal>[0-7]+)$/				, "not-fixed-input" : /^[0-7]*$/		},
	"d" : { "radix" :10, "isUpperCase" : false, "fixed-input" : /^(?<neg>[+-]?)(?<decimal>[0-9]+)$/	, "not-fixed-input" : /^[+-]?[0-9]*$/	},
	"x" : {	"radix" :16, "isUpperCase" : false, "fixed-input" : /^(?<decimal>[0-9a-fA-F]+)$/		, "not-fixed-input" : /^[0-9a-fA-F]*$/	},
	"X" : { "radix" :16, "isUpperCase" : true,  "fixed-input" : /^(?<decimal>[0-9a-fA-F]+)$/		, "not-fixed-input" : /^[0-9a-fA-F]*$/	},
	"f" : {	"radix" :10, "isUpperCase" : false, "fixed-input" : /^(?<neg>[+-]?)(?<decimal>[0-9]+)(?<dot>\.?)(?<fraction>[0-9]*)$/,
		"not-fixed-input" : /^[+-]?[0-9]*\.*[0-9]*$/ }
};


Vue.component('input-number', {

	////////////////////////////////////////////////////////////////////////
	//
	// プロパティ
	//
	props : {
		value  : { type : Number, required : true },
		width  : {
			type        : String
		},
		min    : {
			type        : Number,
			default     : Number.NEGATIVE_INFINITY
		},
		max    : {
			tyee        : Number,
			default     : Number.POSITIVE_INFINITY
		},
		step   : {
			type        : Number,
			default     : 1
		},
		format : {
			type        : String,
			default     : "%d",
			validator   : function(value) {
				return FORMAT_PATTERN.test(value);
			}
		},
	},

	////////////////////////////////////////////////////////////////////////
	//
	// データ
	//
	//
	data : function() {
		return {
			displayValue : this.toDisplayValue(this.value),
			delay : 10,
			timer : null
		}
	},

	////////////////////////////////////////////////////////////////////////
	//
	// メソッド
	//
	methods : {

		/**
		 * フォーマット情報を取得します。
		 *
		 * @return フォーマット情報
		 */
		getFormatInfo : function() {
			var info = {};
			info.match = this.format.match(FORMAT_PATTERN);
			info.info  = FORMAT_INFO[info.match.groups.format];
			return info;
		},


		/**
		 * 指定された数値を format に従い、表示用文字列に変換します。
		 *
		 * @param numValue 数値
		 * @return 表示用文字列
		 */
		toDisplayValue : function(numValue) {

			// 数値 --(進数に応じて)--> 文字列化
			let fmt   = this.getFormatInfo();
			var tmpStrValue = numValue.toString(fmt.info.radix);

			// [符号][整数][ドット][小数] に分割
			let match       = tmpStrValue.match(fmt.info["fixed-input"]);
			if (!match) {
				console.error("Invalid value : " + numValue + " (format = " + this.format + ")");
				return "0";
			}

			// [整数部] パディング追加
			var decimalStr = match.groups.decimal;
			if (fmt.match.groups.padding && (fmt.match.groups.padding.charAt(0) == '0')) {
				decimalPadSize = fmt.match.groups.padding.substring(1, fmt.match.groups.padding.length) - 0;
				decimalStr     = decimalStr.padStart(decimalPadSize, '0');
			}

			// [小数部] パディング追加
			var fractionStr = match.groups.fraction;
			if (fmt.match.groups.paddingfloat) {
				fractionPadSize = fmt.match.groups.paddingfloat - 0;
				fractionStr     = fractionStr.padEnd(fractionPadSize, "0");
				// 桁揃え
				fractionStr     = fractionStr.slice(0, fractionPadSize);
			}

			// 再結合
			tmpStrValue = "";
			tmpStrValue += (fmt.match.groups.prefix) ? fmt.match.groups.prefix : "";
			tmpStrValue += (match.groups.neg) ? match.groups.neg : "";
			tmpStrValue += (decimalStr) ? decimalStr       : "";
			if (fractionStr) {
				tmpStrValue += ".";
				tmpStrValue += (fractionStr) ? fractionStr      : "";
			}
			tmpStrValue += (fmt.match.groups.suffix) ? fmt.match.groups.suffix: "";

			return tmpStrValue;
		},

		/**
		 * format に従った文字列を、数値に変換します。
		 *
		 * @param strValue 文字列
		 * @return 数値
		 */
		toValue : function(strValue) {
			let fmt    = this.getFormatInfo();
			var tmpStrValue = strValue;

			// prefix 除去
			let prefix = fmt.match.groups.prefix;
			if (tmpStrValue.indexOf(prefix) == 0) {
				tmpStrValue = tmpStrValue.substring(prefix.length);
			}

			// suffix 除去
			let suffix = fmt.match.groups.suffix;
			if (tmpStrValue.lastIndexOf(suffix) == (tmpStrValue.length - suffix.length)) {
				tmpStrValue = tmpStrValue.substring(0, (tmpStrValue.length - suffix.length));
			}

			// [符号][整数][ドット][小数] に分割
			let match = tmpStrValue.match(fmt.info["fixed-input"]);
			if (!match) {
				console.error("Invalid value : " + strValue + " (format = " + this.format + ")");
				return 0;
			}

			// [整数部] パディング除去
			var decimalStr = match.groups.decimal;
			if (fmt.match.groups.padding && (fmt.match.groups.padding.charAt(0) == '0')) {
				decimalStr = decimalStr.replace(/^0+/, "");
			}

			// [小数部] パディング削除
			var fractionStr = match.groups.fraction;
			if (fmt.match.groups.paddingfloat) {
				fractionStr = fractionStr.replace(/0+$/, "");
			}

			// 再結合
			tmpStrValue = "";
			tmpStrValue += (match.groups.neg) ? match.groups.neg : "";
			tmpStrValue += (decimalStr) ? decimalStr       : "";
			if (fractionStr) {
				tmpStrValue += ".";
				tmpStrValue += (fractionStr) ? fractionStr      : "";
			}

			// 数値化
			var tmpNumValue;
			if (fmt.match.groups.format == 'f') {
				tmpNumValue = parseFloat(tmpStrValue);
			} else {
				tmpNumValue = parseInt(tmpStrValue, fmt.info.radix);
			}

			// 数値化できない場合は 0 を設定しておく
			if (isNaN(tmpNumValue)) {
				tmpNumValue = 0;
			}

			return tmpNumValue;
		},

		/**
		 * 指定された値 numValue に step の値を足し合わせます。
		 * 足し合わせ後の有効桁数は、step の桁数に合わせられます。
		 *
		 * @param numValue 数値
		 * @param step     足し合わせる数
		 */
		roundStep : function(numValue, step) {
			var tmpNumValue = numValue + step;
			var tmpStrStep  = step + "";
			var fdigit      = tmpStrStep.lastIndexOf('.');
			if (fdigit >= 0) {
				fdigit      = tmpStrStep.length - fdigit;
			} else {
				fdigit = 0;
			}
			tmpNumValue = Math.round((tmpNumValue * Math.pow(10, fdigit))) / Math.pow(10, fdigit);
			return tmpNumValue;
		},

		/**
		 * 値を +step します。
		 */
		spinUp : function() {
			document.getSelection().empty();
			var tmpNumValue = this.toValue(this.displayValue);
			tmpNumValue = this.roundStep(tmpNumValue, this.step);
			this.updateValue(tmpNumValue);
		},

		/**
		 * 値を -step します。
		 */
		spinDown : function() {
			document.getSelection().empty();
			var tmpNumValue = this.toValue(this.displayValue);
			tmpNumValue = this.roundStep(tmpNumValue, -this.step);
			this.updateValue(tmpNumValue);
		},

		/**
		 * 入力値変化発生時に呼び出されます。
		 */
		changedValue : function(event) {
			var tmpNumValue = this.toValue(event.target.value);
			this.updateValue(tmpNumValue);
		},


		/**
		 * 指定された値に更新します。
		 *
		 * @param numValue 値
		 */
		updateValue : function(numValue) {
			// 値範囲チェック
			var tmpNumValue = numValue;
			if (tmpNumValue < this.min) { tmpNumValue = this.min; }
			if (tmpNumValue > this.max) { tmpNumValue = this.max; }

			// 表示数値文字列確定
			tmpDisplayValue = this.toDisplayValue(tmpNumValue);
			this.displayValue = tmpDisplayValue;

			// 数値確定
			tmpNumValue = this.toValue(tmpDisplayValue);
			this.$emit('input', tmpNumValue);
		},

		/**
		 * ▲押下時に呼び出されます。
		 */
		pressUp : function() {
			this.timer = setInterval(() => {
				if (this.delay <= 0) {
					this.spinUp();
				} else {
					this.delay--;
				}
			}, 50);
		},
		pressDown : function() {
			this.timer = setInterval(() => {
				if (this.delay <= 0) {
					this.spinDown();
				} else {
					this.delay--;
				}
			}, 50);
		},
		pressOut : function() {
			clearInterval(this.timer);
			this.delay = 10;
		},

	},

	watch : {

		/**
		 * 入力制限処理。
		 *
		 * @param newValue 入力された文字列
		 * @param oldValue 元の文字列
		 */
		displayValue : function(newValue, oldValue) {
			let fmt = this.getFormatInfo();
			if (!fmt.info["not-fixed-input"].test(newValue)) {
				this.displayValue = oldValue;
			}
		}

	},

	template: `
		<div class="input-number">
			<input class="input-number-text" :style="{ width: width }" type="text" v-model="displayValue" @change="changedValue($event)">
			</input>
			<div class="spin-block">
				<svg class="spin" x="0px" y="0px" width="12px" height="10px" @click="spinUp"   @contextmenu.prevent @touchstart="pressUp"   @touchend="pressOut" @mousedown="pressUp" @mouseup="pressOut" @mouseleave="pressOut">
					<polygon class="spin-button" points=" 6  2,  2  8, 10  8" />
				</svg>
				<svg class="spin" x="0px" y="0px" width="12px" height="10px" @click="spinDown" @contextmenu.prevent @touchstart="pressDown" @touchend="pressOut" @mousedown="pressDown" @mouseup="pressOut" @mouseleave="pressOut">
					<polygon class="spin-button" points=" 6  8,  2  2, 10  2" />
				</svg>
			</div>
		</div>
	`
})
