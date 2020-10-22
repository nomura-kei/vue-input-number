
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
	// �v���p�e�B
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
	// �f�[�^
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
	// ���\�b�h
	//
	methods : {

		/**
		 * �t�H�[�}�b�g�����擾���܂��B
		 *
		 * @return �t�H�[�}�b�g���
		 */
		getFormatInfo : function() {
			var info = {};
			info.match = this.format.match(FORMAT_PATTERN);
			info.info  = FORMAT_INFO[info.match.groups.format];
			return info;
		},


		/**
		 * �w�肳�ꂽ���l�� format �ɏ]���A�\���p������ɕϊ����܂��B
		 *
		 * @param numValue ���l
		 * @return �\���p������
		 */
		toDisplayValue : function(numValue) {

			// ���l --(�i���ɉ�����)--> ������
			let fmt   = this.getFormatInfo();
			var tmpStrValue = numValue.toString(fmt.info.radix);

			// [����][����][�h�b�g][����] �ɕ���
			let match       = tmpStrValue.match(fmt.info["fixed-input"]);
			if (!match) {
				console.error("Invalid value : " + numValue + " (format = " + this.format + ")");
				return "0";
			}

			// [������] �p�f�B���O�ǉ�
			var decimalStr = match.groups.decimal;
			if (fmt.match.groups.padding && (fmt.match.groups.padding.charAt(0) == '0')) {
				decimalPadSize = fmt.match.groups.padding.substring(1, fmt.match.groups.padding.length) - 0;
				decimalStr     = decimalStr.padStart(decimalPadSize, '0');
			}

			// [������] �p�f�B���O�ǉ�
			var fractionStr = match.groups.fraction;
			if (fmt.match.groups.paddingfloat) {
				fractionPadSize = fmt.match.groups.paddingfloat - 0;
				fractionStr     = fractionStr.padEnd(fractionPadSize, "0");
				// ������
				fractionStr     = fractionStr.slice(0, fractionPadSize);
			}

			// �Č���
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
		 * format �ɏ]������������A���l�ɕϊ����܂��B
		 *
		 * @param strValue ������
		 * @return ���l
		 */
		toValue : function(strValue) {
			let fmt    = this.getFormatInfo();
			var tmpStrValue = strValue;

			// prefix ����
			let prefix = fmt.match.groups.prefix;
			if (tmpStrValue.indexOf(prefix) == 0) {
				tmpStrValue = tmpStrValue.substring(prefix.length);
			}

			// suffix ����
			let suffix = fmt.match.groups.suffix;
			if (tmpStrValue.lastIndexOf(suffix) == (tmpStrValue.length - suffix.length)) {
				tmpStrValue = tmpStrValue.substring(0, (tmpStrValue.length - suffix.length));
			}

			// [����][����][�h�b�g][����] �ɕ���
			let match = tmpStrValue.match(fmt.info["fixed-input"]);
			if (!match) {
				console.error("Invalid value : " + strValue + " (format = " + this.format + ")");
				return 0;
			}

			// [������] �p�f�B���O����
			var decimalStr = match.groups.decimal;
			if (fmt.match.groups.padding && (fmt.match.groups.padding.charAt(0) == '0')) {
				decimalStr = decimalStr.replace(/^0+/, "");
			}

			// [������] �p�f�B���O�폜
			var fractionStr = match.groups.fraction;
			if (fmt.match.groups.paddingfloat) {
				fractionStr = fractionStr.replace(/0+$/, "");
			}

			// �Č���
			tmpStrValue = "";
			tmpStrValue += (match.groups.neg) ? match.groups.neg : "";
			tmpStrValue += (decimalStr) ? decimalStr       : "";
			if (fractionStr) {
				tmpStrValue += ".";
				tmpStrValue += (fractionStr) ? fractionStr      : "";
			}

			// ���l��
			var tmpNumValue;
			if (fmt.match.groups.format == 'f') {
				tmpNumValue = parseFloat(tmpStrValue);
			} else {
				tmpNumValue = parseInt(tmpStrValue, fmt.info.radix);
			}

			// ���l���ł��Ȃ��ꍇ�� 0 ��ݒ肵�Ă���
			if (isNaN(tmpNumValue)) {
				tmpNumValue = 0;
			}

			return tmpNumValue;
		},

		/**
		 * �w�肳�ꂽ�l numValue �� step �̒l�𑫂����킹�܂��B
		 * �������킹��̗L�������́Astep �̌����ɍ��킹���܂��B
		 *
		 * @param numValue ���l
		 * @param step     �������킹�鐔
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
		 * �l�� +step ���܂��B
		 */
		spinUp : function() {
			document.getSelection().empty();
			var tmpNumValue = this.toValue(this.displayValue);
			tmpNumValue = this.roundStep(tmpNumValue, this.step);
			this.updateValue(tmpNumValue);
		},

		/**
		 * �l�� -step ���܂��B
		 */
		spinDown : function() {
			document.getSelection().empty();
			var tmpNumValue = this.toValue(this.displayValue);
			tmpNumValue = this.roundStep(tmpNumValue, -this.step);
			this.updateValue(tmpNumValue);
		},

		/**
		 * ���͒l�ω��������ɌĂяo����܂��B
		 */
		changedValue : function(event) {
			var tmpNumValue = this.toValue(event.target.value);
			this.updateValue(tmpNumValue);
		},


		/**
		 * �w�肳�ꂽ�l�ɍX�V���܂��B
		 *
		 * @param numValue �l
		 */
		updateValue : function(numValue) {
			// �l�͈̓`�F�b�N
			var tmpNumValue = numValue;
			if (tmpNumValue < this.min) { tmpNumValue = this.min; }
			if (tmpNumValue > this.max) { tmpNumValue = this.max; }

			// �\�����l������m��
			tmpDisplayValue = this.toDisplayValue(tmpNumValue);
			this.displayValue = tmpDisplayValue;

			// ���l�m��
			tmpNumValue = this.toValue(tmpDisplayValue);
			this.$emit('input', tmpNumValue);
		},

		/**
		 * ���������ɌĂяo����܂��B
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
		 * ���͐��������B
		 *
		 * @param newValue ���͂��ꂽ������
		 * @param oldValue ���̕�����
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
