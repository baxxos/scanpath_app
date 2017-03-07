angular.module('gazerApp').service('CanvasDrawService', function() {
	// Handles drawing of basic geometric shapes onto the canvas
	this.drawCircle = function(ctx, coords, strokeColor, lineWidth, fillColor) {
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, coords.r, 0, 2*Math.PI, false);

		// Optional: fill the circle area
		if(fillColor) {
			ctx.fillStyle = fillColor;
        	ctx.fill();
		}

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    };

	this.drawLine = function(ctx, begin, end, color, lineWidth) {
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
		ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    this.drawRect = function(ctx, coords, strokeColor, lineWidth, fillColor) {
		ctx.beginPath();
		ctx.rect(coords.x, coords.y, coords.xLen, coords.yLen);
		ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeColor;
		ctx.stroke();

		// Optional: fill the rect area
		if(fillColor) {
			ctx.fillStyle = fillColor;
        	ctx.fill();
		}
	};

	// Advanced scanpath geometry methods
	this.drawLabel = function(ctx, canvasInfo, aoiBox) {
		// Initialize label style
		var fontSize = canvasInfo.fontSize;
		ctx.font = 'bold ' + fontSize + 'px Helvetica, Arial';
		ctx.textAlign = 'center';
		ctx.lineWidth = canvasInfo.offset;

		// Draw the label background rectangle in the center of the AOI box
		var labelBox = {
			x: aoiBox.x + (aoiBox.xLen / 2) - (fontSize / 2), // Center the label horizontally
			y: aoiBox.y + (aoiBox.yLen / 2) - (fontSize - ctx.lineWidth), // Center it vertically
			xLen: fontSize,
			yLen: fontSize
		};
		this.drawRect(ctx, labelBox, '#000', canvasInfo.offset, '#000');

		// Draw text in the exact center of the AOI box
		ctx.fillStyle = '#fff';
		ctx.fillText(aoiBox.name, aoiBox.x + (aoiBox.xLen / 2) , aoiBox.y + (aoiBox.yLen / 2));
	};

	this.drawSaccade = function(ctx, canvasInfo, aois, prevFixation, actFixation) {
		// Draw a line connecting each pair of fixations in the given scanpath
		// Passed fixations are formatted as: [["E", 500], ["C", 350] ... ]

		// Skip undefined AOIs (e.g. wrong user input)
		if(!aois[prevFixation[0]] || !aois[actFixation[0]]) {
			console.error('No such area of interest : ' + prevFixation[0] + ' or ' + actFixation[0]);
			return false;
		}

		// Line from the center of the previous fixation
		var lineFrom = {
			x: aois[prevFixation[0]].x + (aois[prevFixation[0]].xLen / 2),
			y: aois[prevFixation[0]].y + (aois[prevFixation[0]].yLen / 2)
		};
		// Line to the center of the current fixation
		var lineTo = {
			x: aois[actFixation[0]].x + (aois[actFixation[0]].xLen / 2),
			y: aois[actFixation[0]].y + (aois[actFixation[0]].yLen / 2)
		};

		this.drawLine(ctx, lineFrom, lineTo, '#000', canvasInfo.offset);
	};

	this.calcBoundingBox = function(data) {
		// Calculates bounding box for a set of square/rectangle AOIs
		var topLeftPoint = {
			x: data[0][1],
			y: data[0][3]
		};

		var bottomRightPoint = {
			x: topLeftPoint.x + data[0][2],
			y: topLeftPoint.y + data[0][4]
		};

		// Search the AOIs for the most upper-left and right-down points
		for(var i = 0; i < data.length; i++) {
			var actAoi = data[i];

			topLeftPoint.x = (actAoi[1] < topLeftPoint.x ? actAoi[1] : topLeftPoint.x);
			topLeftPoint.y = (actAoi[3] < topLeftPoint.y ? actAoi[3] : topLeftPoint.y);

			bottomRightPoint.x =
				(actAoi[1] + actAoi[2] > bottomRightPoint.x ? actAoi[1] + actAoi[2] : bottomRightPoint.x);
			bottomRightPoint.y =
				(actAoi[3] + actAoi[4] > bottomRightPoint.y ? actAoi[3] + actAoi[4] : bottomRightPoint.y);
		}

		return {
			topLeftPoint: topLeftPoint,
			bottomRightPoint: bottomRightPoint
		}
	};
});