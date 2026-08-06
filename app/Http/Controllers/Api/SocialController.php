<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SocialController extends Controller
{
    public function friends()
    {
        $userId = Auth::id();

        // Get accepted friends where user is either user_id or friend_id
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function($q) use ($userId) {
                $q->where('user_id', $userId)
                  ->orWhere('friend_id', $userId);
            })
            ->get()
            ->map(function($f) use ($userId) {
                return $f->user_id == $userId ? $f->friend_id : $f->user_id;
            })
            ->toArray();

        $pendingRequestIds = DB::table('friendships')
            ->where('status', 'pending')
            ->where('friend_id', $userId) // Requests sent TO the user
            ->pluck('user_id')
            ->toArray();

        $friends = User::whereIn('id', $friendIds)
            ->select('id', 'name', 'avatar', 'membership_type')
            ->get()
            ->map(function($u) {
                $u->avatar_url = $u->avatar ? asset('storage/' . $u->avatar) : null;
                $u->status = rand(0, 1) ? 'Online' : 'Offline'; // Mock online status
                $u->action = $u->status == 'Online' ? 'In the Gym' : 'Active 2h ago'; // Mock action
                return $u;
            });

        $requests = User::whereIn('id', $pendingRequestIds)
            ->select('id', 'name', 'avatar', 'membership_type')
            ->get()
            ->map(function($u) {
                $u->avatar_url = $u->avatar ? asset('storage/' . $u->avatar) : null;
                return $u;
            });

        // Get potential friends (members not yet friends)
        $potential = User::where('role', 'member')
            ->where('id', '!=', $userId)
            ->whereNotIn('id', array_merge($friendIds, $pendingRequestIds))
            ->inRandomOrder()
            ->take(10)
            ->get()
            ->map(function($u) {
                $u->avatar_url = $u->avatar ? asset('storage/' . $u->avatar) : null;
                return $u;
            });

        return response()->json([
            'friends' => $friends,
            'requests' => $requests,
            'potential' => $potential
        ]);
    }

    public function addFriend(Request $request)
    {
        $request->validate(['friend_id' => 'required|exists:users,id']);
        
        $exists = DB::table('friendships')
            ->where(function($q) use ($request) {
                $q->where('user_id', Auth::id())->where('friend_id', $request->friend_id);
            })->orWhere(function($q) use ($request) {
                $q->where('user_id', $request->friend_id)->where('friend_id', Auth::id());
            })->exists();

        if ($exists) {
            return response()->json(['message' => 'Friendship already exists or pending.'], 400);
        }

        DB::table('friendships')->insert([
            'user_id' => Auth::id(),
            'friend_id' => $request->friend_id,
            'status' => 'pending', 
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Friend request sent!']);
    }

    public function acceptFriend(Request $request)
    {
        $request->validate(['friend_id' => 'required|exists:users,id']);

        DB::table('friendships')
            ->where('user_id', $request->friend_id)
            ->where('friend_id', Auth::id())
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        return response()->json(['message' => 'Friend request accepted!']);
    }

    public function messages($friendId)
    {
        $userId = Auth::id();

        $messages = DB::table('messages')
            ->where(function($q) use ($userId, $friendId) {
                $q->where('sender_id', $userId)->where('receiver_id', $friendId);
            })
            ->orWhere(function($q) use ($userId, $friendId) {
                $q->where('sender_id', $friendId)->where('receiver_id', $userId);
            })
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($m) use ($userId) {
                // Get reactions grouped
                $reactions = DB::table('message_reactions')
                    ->where('message_id', $m->id)
                    ->select('emoji', DB::raw('count(*) as count'), DB::raw('GROUP_CONCAT(user_id) as user_ids'))
                    ->groupBy('emoji')
                    ->get()
                    ->map(fn($r) => [
                        'emoji'    => $r->emoji,
                        'count'    => (int)$r->count,
                        'hasReacted' => in_array($userId, explode(',', $r->user_ids ?? ''))
                    ])
                    ->toArray();

                return [
                    'id'        => (string)$m->id,
                    'senderId'  => (string)$m->sender_id,
                    'text'      => $m->unsent ? null : $m->content,
                    'imageUrl'  => ($m->image_url && !$m->unsent) ? asset('storage/' . $m->image_url) : null,
                    'time'      => date('h:i A', strtotime($m->created_at)),
                    'isMe'      => $m->sender_id == $userId,
                    'isRead'    => (bool)$m->is_read,
                    'unsent'    => (bool)($m->unsent ?? false),
                    'reactions' => $reactions,
                ];
            });

        // Mark received messages as read
        DB::table('messages')
            ->where('receiver_id', $userId)
            ->where('sender_id', $friendId)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id'  => 'required|exists:users,id',
            'content'      => 'nullable|string',
            'image_base64' => 'nullable|string'
        ]);

        $imagePath = null;
        if ($request->filled('image_base64')) {
            $image_parts = explode(";base64,", $request->image_base64);
            $image_type_aux = explode("image/", $image_parts[0]);
            $image_type = isset($image_type_aux[1]) ? $image_type_aux[1] : 'jpeg';
            $image_base64 = base64_decode($image_parts[1] ?? $image_parts[0]);
            $imageName = 'messages/' . uniqid() . '.' . $image_type;

            if (!\Illuminate\Support\Facades\Storage::disk('public')->exists('messages')) {
                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('messages');
            }

            \Illuminate\Support\Facades\Storage::disk('public')->put($imageName, $image_base64);
            $imagePath = $imageName;
        }

        if (empty($request->content) && empty($imagePath)) {
            return response()->json(['message' => 'Cannot send empty message'], 400);
        }

        $id = DB::table('messages')->insertGetId([
            'sender_id'   => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content'     => $request->content,
            'image_url'   => $imagePath,
            'is_read'     => false,
            'unsent'      => false,
            'created_at'  => now(),
            'updated_at'  => now()
        ]);

        return response()->json([
            'message' => 'Sent!',
            'msg' => [
                'id'        => (string)$id,
                'senderId'  => (string)Auth::id(),
                'text'      => $request->content,
                'imageUrl'  => $imagePath ? asset('storage/' . $imagePath) : null,
                'time'      => date('h:i A'),
                'isMe'      => true,
                'isRead'    => false,
                'unsent'    => false,
                'reactions' => [],
            ]
        ]);
    }

    // ─── Delete message (hide from my side only) ───
    public function deleteMessage($id)
    {
        $msg = DB::table('messages')->where('id', $id)->first();
        if (!$msg) return response()->json(['message' => 'Not found'], 404);

        // Only the sender or receiver can delete for themselves
        if ($msg->sender_id != Auth::id() && $msg->receiver_id != Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::table('messages')->where('id', $id)->update([
            'deleted_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Message deleted']);
    }

    // ─── Unsend message (replace content with [unsent]) ───
    public function unsendMessage($id)
    {
        $msg = DB::table('messages')->where('id', $id)->first();
        if (!$msg) return response()->json(['message' => 'Not found'], 404);

        if ($msg->sender_id != Auth::id()) {
            return response()->json(['message' => 'You can only unsend your own messages'], 403);
        }

        DB::table('messages')->where('id', $id)->update([
            'unsent'     => true,
            'content'    => null,
            'image_url'  => null,
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Message unsent']);
    }

    // ─── React to a message ───
    public function reactToMessage(Request $request, $id)
    {
        $request->validate(['emoji' => 'required|string|max:10']);
        $userId = Auth::id();

        // Toggle: if same emoji exists, remove it
        $exists = DB::table('message_reactions')
            ->where('message_id', $id)
            ->where('user_id', $userId)
            ->where('emoji', $request->emoji)
            ->exists();

        if ($exists) {
            DB::table('message_reactions')
                ->where('message_id', $id)
                ->where('user_id', $userId)
                ->where('emoji', $request->emoji)
                ->delete();
            return response()->json(['message' => 'Reaction removed']);
        }

        // Replace any existing reaction from this user on this message
        DB::table('message_reactions')
            ->where('message_id', $id)
            ->where('user_id', $userId)
            ->delete();

        DB::table('message_reactions')->insert([
            'message_id' => $id,
            'user_id'    => $userId,
            'emoji'      => $request->emoji,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Reaction added']);
    }

    public function activityFeed()
    {
        $userId = Auth::id();
        
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function($q) use ($userId) {
                $q->where('user_id', $userId)->orWhere('friend_id', $userId);
            })
            ->get()
            ->map(function($f) use ($userId) {
                return $f->user_id == $userId ? $f->friend_id : $f->user_id;
            })
            ->toArray();
            
        $friendIds[] = $userId; // Include own activities

        $activities = DB::table('activities')
            ->join('users', 'activities.user_id', '=', 'users.id')
            ->whereIn('activities.user_id', $friendIds)
            ->select('activities.*', 'users.name as user_name', 'users.avatar as user_avatar')
            ->orderBy('activities.created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($a) use ($userId) {
                $likes = DB::table('activity_likes')->where('activity_id', $a->id)->count();
                $isLiked = DB::table('activity_likes')->where('activity_id', $a->id)->where('user_id', $userId)->exists();
                $comments = DB::table('activity_comments')
                    ->join('users', 'activity_comments.user_id', '=', 'users.id')
                    ->where('activity_id', $a->id)
                    ->select('activity_comments.*', 'users.name as user_name', 'users.avatar as user_avatar')
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function($c) {
                        return [
                            'id' => $c->id,
                            'userId' => $c->user_id,
                            'userName' => $c->user_name,
                            'userAvatar' => $c->user_avatar ? asset('storage/' . $c->user_avatar) : null,
                            'text' => $c->comment,
                            'time' => date('M d, h:i A', strtotime($c->created_at))
                        ];
                    });

                return [
                    'id' => $a->id,
                    'userId' => $a->user_id,
                    'userName' => $a->user_name,
                    'userAvatar' => $a->user_avatar ? asset('storage/' . $a->user_avatar) : null,
                    'type' => $a->type,
                    'title' => $a->title,
                    'duration' => $a->duration_minutes,
                    'notes' => $a->notes,
                    'photoUri' => $a->photo_uri, // We might need to map to asset() if it's a local file, but for now it's direct URI
                    'date' => $a->created_at,
                    'likes' => $likes,
                    'isLiked' => $isLiked,
                    'comments' => $comments
                ];
            });

        return response()->json($activities);
    }

    public function publicProfile($id)
    {
        $userId = Auth::id();
        $profileUser = User::findOrFail($id);

        $friendship = DB::table('friendships')
            ->where(function($q) use ($userId, $id) {
                $q->where('user_id', $userId)->where('friend_id', $id);
            })->orWhere(function($q) use ($userId, $id) {
                $q->where('user_id', $id)->where('friend_id', $userId);
            })->first();

        $status = $friendship ? $friendship->status : 'none';
        if ($status == 'pending' && $friendship->user_id == $userId) {
            $status = 'sent';
        }

        $activities = DB::table('activities')
            ->where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function($a) use ($userId, $profileUser) {
                $likes = DB::table('activity_likes')->where('activity_id', $a->id)->count();
                $isLiked = DB::table('activity_likes')->where('activity_id', $a->id)->where('user_id', $userId)->exists();
                
                $comments = DB::table('activity_comments')
                    ->join('users', 'activity_comments.user_id', '=', 'users.id')
                    ->where('activity_id', $a->id)
                    ->select('activity_comments.*', 'users.name as user_name', 'users.avatar as user_avatar')
                    ->orderBy('created_at', 'asc')
                    ->get()
                    ->map(function($c) {
                        return [
                            'id' => $c->id,
                            'userId' => $c->user_id,
                            'userName' => $c->user_name,
                            'userAvatar' => $c->user_avatar ? asset('storage/' . $c->user_avatar) : null,
                            'text' => $c->comment,
                            'time' => date('M d, h:i A', strtotime($c->created_at))
                        ];
                    });

                return [
                    'id' => $a->id,
                    'userId' => $a->user_id,
                    'userName' => $profileUser->name,
                    'userAvatar' => $profileUser->avatar ? asset('storage/' . $profileUser->avatar) : null,
                    'type' => $a->type,
                    'title' => $a->title,
                    'duration' => $a->duration_minutes,
                    'notes' => $a->notes,
                    'photoUri' => $a->photo_uri,
                    'date' => $a->created_at,
                    'likes' => $likes,
                    'isLiked' => $isLiked,
                    'comments' => $comments
                ];
            });

        return response()->json([
            'id' => $profileUser->id,
            'name' => $profileUser->name,
            'avatar_url' => $profileUser->avatar ? asset('storage/' . $profileUser->avatar) : null,
            'membership_type' => $profileUser->membership_type,
            'friendship_status' => $status,
            'activities' => $activities
        ]);
    }

    public function storeActivity(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'title' => 'nullable|string',
            'duration_minutes' => 'nullable|integer',
            'notes' => 'nullable|string',
            'photo_uri' => 'nullable|string',
        ]);

        $id = DB::table('activities')->insertGetId([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'title' => $request->title ?: $request->type,
            'duration_minutes' => $request->duration_minutes,
            'notes' => $request->notes,
            'photo_uri' => $request->photo_uri,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Activity logged!', 'id' => $id]);
    }

    public function toggleLike(Request $request, $id)
    {
        $userId = Auth::id();
        $exists = DB::table('activity_likes')->where('activity_id', $id)->where('user_id', $userId)->exists();

        if ($exists) {
            DB::table('activity_likes')->where('activity_id', $id)->where('user_id', $userId)->delete();
            return response()->json(['message' => 'Unliked', 'isLiked' => false]);
        } else {
            DB::table('activity_likes')->insert([
                'activity_id' => $id,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            return response()->json(['message' => 'Liked', 'isLiked' => true]);
        }
    }

    public function addComment(Request $request, $id)
    {
        $request->validate(['comment' => 'required|string']);

        $commentId = DB::table('activity_comments')->insertGetId([
            'activity_id' => $id,
            'user_id' => Auth::id(),
            'comment' => $request->comment,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $user = Auth::user();

        return response()->json([
            'message' => 'Comment added',
            'comment' => [
                'id' => $commentId,
                'userId' => $user->id,
                'userName' => $user->name,
                'userAvatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'text' => $request->comment,
                'time' => date('M d, h:i A')
            ]
        ]);
    }
}
