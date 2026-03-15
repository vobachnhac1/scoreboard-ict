# #!/bin/bash

# # Test API script for Scoreboard ICT
# # Usage: ./test-api.sh

# API_URL="http://localhost:6789"

# echo "🧪 Testing Scoreboard ICT API"
# echo "================================"
# echo ""

# # Test 1: Health check
# echo "1️⃣ Testing health check..."
# curl -s "${API_URL}/health" | jq '.'
# echo ""
# echo ""

# # Test 2: Finish match - RED wins
# echo "2️⃣ Testing finish match - RED wins..."
# curl -s -X POST "${API_URL}/api/matches/finish" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "match_id": "TEST001",
#     "status": "FIN",
#     "red_score": 15,
#     "blue_score": 12,
#     "red_remind": 1,
#     "blue_remind": 2,
#     "red_warn": 0,
#     "blue_warn": 1,
#     "red_kick": 3,
#     "blue_kick": 2,
#     "winner": "red",
#     "total_rounds": 3,
#     "final_time": "00:05.3",
#     "action_history": [
#       {
#         "id": 1,
#         "actionType": "score",
#         "team": "red",
#         "value": 2,
#         "description": "Điểm 2"
#       }
#     ],
#     "round_history": [
#       {
#         "round": 1,
#         "red_score": 5,
#         "blue_score": 4,
#         "red_remind": 0,
#         "blue_remind": 1,
#         "red_warn": 0,
#         "blue_warn": 0,
#         "round_type": "MAIN",
#         "status": "COMPLETED"
#       },
#       {
#         "round": 2,
#         "red_score": 10,
#         "blue_score": 8,
#         "red_remind": 1,
#         "blue_remind": 1,
#         "red_warn": 0,
#         "blue_warn": 1,
#         "round_type": "MAIN",
#         "status": "COMPLETED"
#       }
#     ],
#     "finished_at": "2025-12-25T10:30:00.000Z",
#     "match_no": "M001",
#     "weight_class": "60kg",
#     "red_athlete_name": "Nguyễn Văn A",
#     "blue_athlete_name": "Trần Văn B"
#   }' | jq '.'
# echo ""
# echo ""

# # Test 3: Finish match - BLUE wins
# echo "3️⃣ Testing finish match - BLUE wins..."
# curl -s -X POST "${API_URL}/api/matches/finish" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "match_id": "TEST002",
#     "status": "FIN",
#     "red_score": 10,
#     "blue_score": 18,
#     "red_remind": 2,
#     "blue_remind": 1,
#     "red_warn": 1,
#     "blue_warn": 0,
#     "red_kick": 2,
#     "blue_kick": 4,
#     "winner": "blue",
#     "total_rounds": 3,
#     "final_time": "00:03.7",
#     "action_history": [],
#     "round_history": [
#       {
#         "round": 1,
#         "red_score": 3,
#         "blue_score": 6,
#         "round_type": "MAIN",
#         "status": "COMPLETED"
#       }
#     ],
#     "finished_at": "2025-12-25T11:00:00.000Z",
#     "match_no": "M002",
#     "weight_class": "65kg",
#     "red_athlete_name": "Lê Văn C",
#     "blue_athlete_name": "Phạm Văn D"
#   }' | jq '.'
# echo ""
# echo ""

# # Test 4: Finish match - Draw
# echo "4️⃣ Testing finish match - Draw..."
# curl -s -X POST "${API_URL}/api/matches/finish" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "match_id": "TEST003",
#     "status": "FIN",
#     "red_score": 12,
#     "blue_score": 12,
#     "winner": null,
#     "total_rounds": 3,
#     "final_time": "00:00.0",
#     "action_history": [],
#     "round_history": [],
#     "finished_at": "2025-12-25T11:30:00.000Z",
#     "match_no": "M003",
#     "weight_class": "70kg",
#     "red_athlete_name": "Hoàng Văn E",
#     "blue_athlete_name": "Vũ Văn F"
#   }' | jq '.'
# echo ""
# echo ""

# # Test 5: Error - Missing match_id
# echo "5️⃣ Testing error - Missing match_id..."
# curl -s -X POST "${API_URL}/api/matches/finish" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "status": "FIN",
#     "red_score": 15,
#     "blue_score": 12
#   }' | jq '.'
# echo ""
# echo ""

# echo " All tests completed!"
# echo ""
# echo " To verify in database, run:"
# echo "   SELECT * FROM v_match_results;"
# echo "   SELECT * FROM round_results WHERE match_id = 'TEST001';"

